-- =============================================================================
-- MEDIA INTELLIGENCE SYSTEM - Database Schema
-- =============================================================================

-- =============================================================================
-- 28. MEDIA ASSETS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path VARCHAR(500) NOT NULL,
    
    -- File metadata
    mime_type VARCHAR(100) NOT NULL,
    format VARCHAR(20) NOT NULL CHECK (format IN ('webp', 'jpeg', 'png', 'gif', 'svg', 'other')),
    size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    
    -- Categorization
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'hero', 'destination', 'accommodation', 'experience', 'gallery',
        'partner', 'testimonial', 'blog', 'profile', 'ui', 'banner', 'other'
    )),
    
    -- Content
    alt_text VARCHAR(255),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Source tracking
    source VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (source IN ('default', 'uploaded')),
    owner_id VARCHAR(255),
    
    -- Variants (JSONB for multiple sizes)
    variants JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    is_optimized BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_category ON media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_source ON media_assets(source);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_active ON media_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_assets(created_at DESC);

-- =============================================================================
-- 29. MEDIA USAGE TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'destination', 'lodges', 'testimonials', 'partners', 
        'experiences', 'packages', 'homepage', 'blog', 'hero', 'other'
    )),
    entity_id VARCHAR(255),
    usage_type VARCHAR(50) NOT NULL CHECK (usage_type IN (
        'primary', 'gallery', 'thumbnail', 'background', 'avatar', 'banner'
    )),
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_media ON media_usage(media_id);
CREATE INDEX IF NOT EXISTS idx_usage_entity ON media_usage(entity_type, entity_id);

-- =============================================================================
-- 30. MEDIA TAGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- 31. DEFAULT ASSETS REGISTRY
-- =============================================================================
CREATE TABLE IF NOT EXISTS default_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_key VARCHAR(100) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    alt_text VARCHAR(255),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- 32. IMAGE OPTIMIZATION QUEUE
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_optimization_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    priority INTEGER DEFAULT 0,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_optimization_status ON media_optimization_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_optimization_media ON media_optimization_queue(media_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_media_updated
    BEFORE UPDATE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_media_timestamp();

-- Update usage count on tag
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE media_tags SET usage_count = usage_count + 1 
        WHERE name = ANY(NEW.tags);
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE media_tags SET usage_count = usage_count - 1 
        WHERE name = ANY(OLD.tags);
        UPDATE media_tags SET usage_count = usage_count + 1 
        WHERE name = ANY(NEW.tags);
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE media_tags SET usage_count = usage_count - 1 
        WHERE name = ANY(OLD.tags);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_media_tags_update
    AFTER INSERT OR UPDATE OR DELETE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- =============================================================================
-- SEED: Default Assets Registry
-- =============================================================================

INSERT INTO default_assets (asset_key, url, category, alt_text, description, tags) VALUES
    ('hero-safari-1', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80', 'hero', 'Safari wildlife in Masai Mara', 'Main hero image for safari homepage', ARRAY['hero', 'safari', 'wildlife', 'masai-mara']),
    ('hero-savanna', 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1920&q=80', 'hero', 'African savanna at sunset', 'Hero for Serengeti destination page', ARRAY['hero', 'serengeti', 'sunset', 'savanna']),
    ('hero-gorilla', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80', 'hero', 'Mountain gorilla in forest', 'Hero for gorilla trekking pages', ARRAY['hero', 'gorilla', 'bwindi', 'rwanda']),
    ('hero-beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', 'hero', 'Zanzibar beach paradise', 'Hero for beach destinations', ARRAY['hero', 'zanzibar', 'beach', 'ocean']),
    ('dest-masai-mara-main', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', 'destination', 'Masai Mara wildlife', 'Primary image for Masai Mara destination', ARRAY['destination', 'masai-mara', 'kenya', 'wildlife']),
    ('dest-serengeti-main', 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80', 'destination', 'Serengeti endless plains', 'Primary image for Serengeti destination', ARRAY['destination', 'serengeti', 'tanzania', 'plains']),
    ('dest-bwindi-main', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80', 'destination', 'Bwindi Impenetrable Forest', 'Primary image for Bwindi destination', ARRAY['destination', 'bwindi', 'uganda', 'forest']),
    ('dest-volcanoes-main', 'https://images.unsplash.com/photo-1548560781-a1f7f9c0b1f1?auto=format&fit=crop&w=1200&q=80', 'destination', 'Volcanoes National Park', 'Primary image for Rwanda volcanoes', ARRAY['destination', 'volcanoes', 'rwanda', 'mountains']),
    ('acc-luxury-lodge', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80', 'accommodation', 'Luxury safari lodge', 'Default luxury lodge interior', ARRAY['accommodation', 'lodge', 'luxury', 'interior']),
    ('acc-tent-camp', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80', 'accommodation', 'Safari tented camp', 'Default tented camp exterior', ARRAY['accommodation', 'tent', 'safari', 'exterior']),
    ('exp-balloon', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80', 'experience', 'Hot air balloon safari', 'Balloon safari experience', ARRAY['experience', 'balloon', 'aerial', 'safari']),
    ('exp-game-drive', 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80', 'experience', 'Game drive vehicle', 'Game drive experience', ARRAY['experience', 'game-drive', 'vehicle', 'wildlife']),
    ('exp-gorilla-trek', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80', 'experience', 'Gorilla trekking', 'Gorilla trekking experience', ARRAY['experience', 'gorilla', 'trekking', 'primates']),
    ('gallery-wildlife-1', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80', 'gallery', 'African wildlife', 'Wildlife photography', ARRAY['gallery', 'wildlife', 'lions']),
    ('gallery-landscape-1', 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80', 'gallery', 'African landscape', 'Landscape photography', ARRAY['gallery', 'landscape', 'sunset']),
    ('gallery-culture-1', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80', 'gallery', 'Local culture', 'Cultural photography', ARRAY['gallery', 'culture', 'people']),
    ('placeholder-hero', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80', 'hero', 'IDENT Africa Safari', 'Default hero placeholder', ARRAY['placeholder', 'hero', 'default']),
    ('placeholder-avatar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'profile', 'Default user avatar', 'Default avatar placeholder', ARRAY['placeholder', 'avatar', 'default']),
    ('placeholder-thumbnail', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80', 'ui', 'Default thumbnail', 'Default thumbnail placeholder', ARRAY['placeholder', 'thumbnail', 'default'])
ON CONFLICT (asset_key) DO NOTHING;

-- =============================================================================
-- VIEWS FOR MEDIA STATISTICS
-- =============================================================================

CREATE OR REPLACE VIEW media_statistics AS
SELECT 
    category,
    COUNT(*) as total_count,
    SUM(size) as total_size,
    COUNT(*) FILTER (WHERE source = 'uploaded') as uploaded_count,
    SUM(size) FILTER (WHERE source = 'uploaded') as uploaded_size,
    COUNT(*) FILTER (WHERE source = 'default') as default_count,
    SUM(size) FILTER (WHERE source = 'default') as default_size
FROM media_assets
WHERE is_active = true
GROUP BY category;

CREATE OR REPLACE VIEW unused_media AS
SELECT ma.*
FROM media_assets ma
LEFT JOIN media_usage mu ON ma.id = mu.media_id
WHERE mu.id IS NULL AND ma.source = 'uploaded'
AND ma.is_active = true;

-- =============================================================================
-- END OF MEDIA SCHEMA
-- =============================================================================
