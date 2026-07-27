-- =============================================================================
-- AI TRAVEL CONCIERGE - Database Schema
-- =============================================================================

-- =============================================================================
-- 56. AI CONVERSATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Session Info
    session_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Context
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Counts
    message_count INTEGER DEFAULT 0,
    recommendations_count INTEGER DEFAULT 0,
    
    -- Source
    source VARCHAR(50) DEFAULT 'chat', -- chat, itinerary, recommendation, admin
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON ai_conversations(is_active);

-- =============================================================================
-- 57. AI MESSAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Message
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Intent (for user messages)
    intent VARCHAR(50),
    intent_confidence DECIMAL(5, 2),
    
    -- Response metadata (for assistant messages)
    response_type VARCHAR(50), -- recommendation, explanation, itinerary, answer
    tokens_used INTEGER,
    model_used VARCHAR(50),
    
    -- Related entities
    related_destinations UUID[] DEFAULT '{}',
    related_packages UUID[] DEFAULT '{}',
    related_suppliers UUID[] DEFAULT '{}',
    
    -- Feedback
    helpful INTEGER DEFAULT 0,
    not_helpful INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON ai_messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_intent ON ai_messages(intent);

-- =============================================================================
-- 58. TRAVELER PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS traveler_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id),
    
    -- Travel Style
    travel_style VARCHAR(50)[] DEFAULT '{}', -- luxury, budget, adventure, relaxation, cultural
    trip_type VARCHAR(50)[] DEFAULT '{}', -- solo, couple, family, group, business
    
    -- Interests
    interests VARCHAR(50)[] DEFAULT '{}', -- wildlife, photography, culture, beaches, hiking, food
    must_see VARCHAR(50)[] DEFAULT '{}', -- big five, mountain gorilla, Victoria falls
    
    -- Accommodation
    accommodation_preference VARCHAR(50) DEFAULT 'mid_range', -- luxury, mid_range, budget, camping
    accommodation_features VARCHAR(50)[] DEFAULT '{}', -- pool, wifi, spa, restaurant
    
    -- Budget
    budget_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, luxury
    budget_per_day DECIMAL(10, 2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Logistics
    preferred_activities VARCHAR(50)[] DEFAULT '{}', -- game drives, walking safari, balloon, boat
    fitness_level VARCHAR(20) DEFAULT 'moderate', -- easy, moderate, active
    mobility_requirements TEXT,
    
    -- Experience
    safari_experience VARCHAR(20) DEFAULT 'first_timer', -- first_timer, intermediate, experienced
    countries_visited VARCHAR(50)[] DEFAULT '{}',
    preferred_group_size VARCHAR(20) DEFAULT 'small', -- solo, small, medium, large
    
    -- Timing
    preferred_season VARCHAR(20), -- jan-dec or general preference
    trip_duration_days INTEGER,
    
    -- Dietary
    dietary_requirements VARCHAR(50)[] DEFAULT '{}', -- vegetarian, vegan, halal, kosher, none
    
    -- Complete profile flag
    is_complete BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traveler_user ON traveler_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_traveler_budget ON traveler_profiles(budget_level);
CREATE INDEX IF NOT EXISTS idx_traveler_style ON traveler_profiles USING GIN(travel_style);

-- =============================================================================
-- 59. AI RECOMMENDATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    conversation_id UUID REFERENCES ai_conversations(id),
    
    -- Recommendation
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN (
        'destination', 'package', 'accommodation', 'experience', 'itinerary', 'supplier'
    )),
    recommendation_id UUID NOT NULL,
    
    -- Why recommended
    reason TEXT,
    match_score DECIMAL(5, 2),
    
    -- Alternative scores for comparison
    alternatives JSONB DEFAULT '[]',
    
    -- Display
    displayed BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    booked BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,
    
    -- Conversion tracking
    conversion_session_id VARCHAR(100),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_booked ON ai_recommendations(booked);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON ai_recommendations(created_at DESC);

-- =============================================================================
-- 60. AI ITINERARIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    conversation_id UUID REFERENCES ai_conversations(id),
    
    -- Itinerary Details
    title VARCHAR(255),
    description TEXT,
    
    -- Trip Details
    destination_id UUID,
    start_date DATE,
    end_date DATE,
    total_days INTEGER,
    
    -- Budget
    estimated_budget DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Content
    days JSONB DEFAULT '[]', -- Array of day objects
    included_activities JSONB DEFAULT '[]',
    included_accommodations JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'saved', 'converted', 'archived')),
    
    -- Version
    version INTEGER DEFAULT 1,
    parent_itinerary_id UUID REFERENCES ai_itineraries(id),
    
    -- Conversion
    booking_id UUID REFERENCES bookings(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_itineraries_user ON ai_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON ai_itineraries(status);

-- =============================================================================
-- 61. AI KNOWLEDGE_BASE TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'destination_fact', 'package_info', 'supplier_info', 'travel_tip', 
        'seasonal_info', 'faq', 'policy', 'cultural_info'
    )),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- Relevance
    entity_type VARCHAR(50), -- destination, package, supplier, general
    entity_id UUID,
    
    -- Keywords for search
    keywords TEXT[] DEFAULT '{}',
    
    -- Usage
    usage_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_type ON ai_knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_entity ON ai_knowledge_base(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON ai_knowledge_base USING GIN(keywords);

-- =============================================================================
-- 62. AI CONTENT GENERATION LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_content_generation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Generation
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'destination_description', 'seo_content', 'marketing_copy', 
        'email_campaign', 'package_description', 'social_post'
    )),
    
    -- Input
    prompt TEXT NOT NULL,
    input_data JSONB DEFAULT '{}',
    
    -- Output
    generated_content TEXT,
    model_used VARCHAR(50),
    tokens_used INTEGER,
    
    -- Review
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Usage
    used_in VARCHAR(100), -- destination_id, package_id, etc.
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generation_type ON ai_content_generation(content_type);
CREATE INDEX IF NOT EXISTS idx_generation_status ON ai_content_generation(status);

-- =============================================================================
-- SEED: Initial Knowledge Base
-- =============================================================================

INSERT INTO ai_knowledge_base (content_type, title, content, keywords, is_verified) VALUES
    ('destination_fact', 'Best Time to Visit Masai Mara', 
     'The best time to visit Masai Mara is during the Great Migration (July to October) when millions of wildebeest cross the Mara River. For general wildlife viewing, the dry season (June to October) offers excellent game viewing as animals gather around water sources.',
     ARRAY['masai mara', 'best time', 'migration', 'wildlife', 'season'],
     true),
    
    ('travel_tip', 'Visa Requirements for Kenya', 
     'Most visitors to Kenya require a visa. E-visas can be obtained online at evisa.go.ke before travel. Processing takes 2-3 business days. Yellow fever vaccination is required if arriving from endemic countries.',
     ARRAY['kenya', 'visa', 'requirements', 'travel', 'documentation'],
     true),
    
    ('seasonal_info', 'East Africa Weather Guide',
     'East Africa has two dry seasons: December-March and June-October. The long rains fall in April-May, and short rains in November. Coastal areas are warm year-round. Mountain regions can be cool.',
     ARRAY['weather', 'seasons', 'rain', 'temperature', 'east africa'],
     true),
    
    ('faq', 'Health and Safety',
     'Travelers should consult their doctor about malaria prophylaxis for areas below 1800m. Yellow fever vaccination is recommended. Pack sunscreen, insect repellent, and a first aid kit. Tap water is generally not safe to drink.',
     ARRAY['health', 'safety', 'malaria', 'vaccination', 'safety'],
     true),
    
    ('cultural_info', 'Safari Etiquette',
     'Respect wildlife by maintaining distance and not making loud noises. Never exit vehicles except in designated areas. Photography with flash is prohibited. Tip your guide and camp staff. Ask permission before photographing local people.',
     ARRAY['etiquette', 'safari', 'culture', 'tips', 'behaviour'],
     true),
    
    ('destination_fact', 'Rwanda Gorilla Trekking',
     'Mountain gorilla trekking in Rwanda costs $1,500 per permit (2024). Treks are limited to 8 visitors per gorilla family daily. Rwanda offers year-round trekking with the dry season (June-September) being most popular.',
     ARRAY['rwanda', 'gorilla', 'trekking', 'permit', 'cost'],
     true),

ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF AI TRAVEL CONCIERGE SCHEMA
-- =============================================================================
