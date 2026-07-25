-- =============================================================================
-- GROWTH ENGINE & ANALYTICS - Database Schema
-- =============================================================================

-- =============================================================================
-- 63. ANALYTICS_EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    
    -- Event
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'page_view', 'destination_view', 'package_view', 'search', 
        'ai_conversation', 'booking_started', 'booking_completed', 'signup',
        'email_click', 'form_submit', 'download', 'video_play', 'share'
    )),
    
    -- Page context
    page VARCHAR(255),
    page_title VARCHAR(255),
    page_url TEXT,
    
    -- Referrer
    referrer TEXT,
    referrer_source VARCHAR(50), -- google, facebook, direct, email, etc.
    
    -- UTM data
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- Device
    device_type VARCHAR(20), -- desktop, mobile, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Location
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_page ON analytics_events(page);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_utm ON analytics_events(utm_source, utm_campaign);

-- =============================================================================
-- 64. BLOG_POSTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    
    -- Media
    featured_image TEXT,
    gallery JSONB DEFAULT '[]',
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[] DEFAULT '{}',
    
    -- Categorization
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Related content
    related_posts UUID[] DEFAULT '{}',
    related_destinations UUID[] DEFAULT '{}',
    
    -- Author
    author_id UUID REFERENCES users(id),
    author_name VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    
    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_seo ON blog_posts USING GIN(keywords);

-- =============================================================================
-- 65. EMAIL_TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Info
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Content
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
        'welcome', 'booking_confirmation', 'booking_cancellation', 'payment_received',
        'payment_failed', 'travel_reminder', 'post_trip', 'newsletter',
        'promotion', 'review_request', 'password_reset', 'verification'
    )),
    
    -- Template
    body_html TEXT,
    body_text TEXT,
    
    -- Variables
    variables JSONB DEFAULT '[]',
    
    -- Settings
    from_name VARCHAR(100),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    
    -- Stats
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default templates
INSERT INTO email_templates (name, subject, template_type, description, is_system, is_active) VALUES
    ('Welcome Email', 'Welcome to IDENT Africa!', 'welcome', 'Sent to new user registrations', true, true),
    ('Booking Confirmation', 'Your Safari Booking is Confirmed!', 'booking_confirmation', 'Sent when booking is confirmed', true, true),
    ('Payment Received', 'Payment Confirmation', 'payment_received', 'Sent when payment is received', true, true),
    ('Travel Reminder', 'Your Safari is Approaching!', 'travel_reminder', 'Sent 7 days before travel', true, true),
    ('Review Request', 'Share Your Safari Experience', 'review_request', 'Sent after trip completion', true, true),
    ('Newsletter', 'Discover Amazing Safari Adventures', 'newsletter', 'Monthly newsletter', false, true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 66. EMAIL_QUEUE TABLE (Enhanced)
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    user_id UUID REFERENCES users(id),
    
    -- Template
    template_id UUID REFERENCES email_templates(id),
    template_type VARCHAR(50),
    
    -- Content
    subject VARCHAR(255) NOT NULL,
    body_html TEXT,
    body_text TEXT,
    
    -- Variables used
    variables JSONB DEFAULT '{}',
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Tracking
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_queue(recipient_email);

-- =============================================================================
-- 67. FAVORITES & WISHLIST TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- What is favorited
    favoritable_type VARCHAR(50) NOT NULL CHECK (favoritable_type IN (
        'destination', 'package', 'accommodation', 'experience', 'supplier'
    )),
    favoritable_id UUID NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, favoritable_type, favoritable_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorites(favoritable_type);

-- =============================================================================
-- 68. REFERRALS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referrer
    referrer_id UUID REFERENCES users(id),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Type
    referral_type VARCHAR(20) DEFAULT 'referral' CHECK (referral_type IN (
        'referral', 'affiliate', 'partner', 'campaign'
    )),
    
    -- Details
    name VARCHAR(100),
    description TEXT,
    
    -- Rewards
    reward_type VARCHAR(20) DEFAULT 'percentage' CHECK (reward_type IN ('percentage', 'fixed', 'credit')),
    reward_value DECIMAL(10, 2) DEFAULT 10,
    reward_description TEXT,
    
    -- Limits
    max_referrals INTEGER,
    max_rewards DECIMAL(12, 2),
    
    -- Tracking
    tracking_pixel TEXT,
    landing_page_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    total_rewards_given DECIMAL(12, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- =============================================================================
-- 69. REFERRAL_USAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS referral_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID NOT NULL REFERENCES referrals(id),
    
    -- Who was referred
    user_id UUID REFERENCES users(id),
    email VARCHAR(255),
    
    -- Conversion tracking
    booking_id UUID REFERENCES bookings(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN (
        'registered', 'first_booking', 'completed', 'rewarded', 'expired'
    )),
    
    -- Reward
    reward_given DECIMAL(10, 2),
    reward_type VARCHAR(20),
    
    -- UTM data for tracking
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    converted_at TIMESTAMP WITH TIME ZONE,
    rewarded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_referral_usages_referral ON referral_usages(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_usages_user ON referral_usages(user_id);

-- =============================================================================
-- 70. CAMPAIGNS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Type
    campaign_type VARCHAR(50) CHECK (campaign_type IN (
        'email', 'social', 'ads', 'content', 'affiliate'
    )),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'active', 'paused', 'completed'
    )),
    
    -- Budget
    budget DECIMAL(12, 2),
    spent DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Tracking
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Dates
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- =============================================================================
-- 71. SEO_PAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Page info
    page_type VARCHAR(50) NOT NULL CHECK (page_type IN (
        'destination', 'package', 'accommodation', 'experience', 'supplier', 'static'
    )),
    page_id UUID,
    
    -- SEO Content
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[] DEFAULT '{}',
    
    -- Open Graph
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    
    -- Structured Data
    schema_type VARCHAR(100), -- Article, Product, BreadcrumbList, etc.
    schema_data JSONB DEFAULT '{}',
    
    -- Technical SEO
    canonical_url TEXT,
    robots VARCHAR(100) DEFAULT 'index, follow',
    
    -- Status
    is_indexed BOOLEAN DEFAULT true,
    is_followed BOOLEAN DEFAULT true,
    
    -- Stats
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    average_position DECIMAL(5, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_slug ON seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_page_type ON seo_pages(page_type);

-- =============================================================================
-- DAILY ANALYTICS AGGREGATES (for reporting)
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    
    -- Traffic
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    
    -- Engagement
    bounce_rate DECIMAL(5, 2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0, -- seconds
    
    -- Conversions
    bookings_started INTEGER DEFAULT 0,
    bookings_completed INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- AI
    ai_conversations INTEGER DEFAULT 0,
    ai_recommendations INTEGER DEFAULT 0,
    
    -- Top pages
    top_pages JSONB DEFAULT '[]',
    top_destinations JSONB DEFAULT '[]',
    
    -- Traffic sources
    traffic_sources JSONB DEFAULT '{}',
    
    -- Device breakdown
    devices JSONB DEFAULT '{}',
    
    -- Countries
    top_countries JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_analytics(date DESC);

-- =============================================================================
-- SEED: Sample Blog Posts
-- =============================================================================
INSERT INTO blog_posts (title, slug, excerpt, category, status, published_at, author_name) VALUES
    ('The Great Migration: Everything You Need to Know', 'great-migration-guide', 
     'Discover the world's most spectacular wildlife event', 'Safari Guide', 'published', NOW() - INTERVAL '10 days', 'IDENT Africa Team'),
    ('Top 10 Luxury Safari Lodges in Kenya', 'luxury-safari-lodges-kenya',
     'Experience the wild in style', 'Accommodation', 'published', NOW() - INTERVAL '7 days', 'Sarah Johnson'),
    ('Photography Tips for Your Safari', 'safari-photography-tips',
     'Capture stunning wildlife moments', 'Tips & Advice', 'published', NOW() - INTERVAL '5 days', 'Mike Chen'),
    ('Rwanda Gorilla Trekking: A Life-Changing Experience', 'rwanda-gorilla-trekking',
     'An unforgettable encounter with mountain gorillas', 'Adventure', 'published', NOW() - INTERVAL '3 days', 'Emma Wilson')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF GROWTH ENGINE SCHEMA
-- =============================================================================
