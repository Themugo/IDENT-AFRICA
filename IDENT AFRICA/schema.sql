-- =============================================================================
-- SAFARIFLOW ECOSYSTEM - DESTINATION MANAGEMENT SYSTEM DATABASE SCHEMA
-- Target DB: PostgreSQL 14+ / Cloud SQL / Supabase
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. DESTINATIONS TABLE (Core Sanctuary / Park Registry)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    country VARCHAR(64) NOT NULL CHECK (country IN ('Kenya', 'Tanzania', 'Uganda', 'Rwanda')),
    region VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Savanna & Plains', 'Crater & Highlands', 'Impenetrable Forest', 'Tropical Coast & Beach', 'Alpine Mountain')),
    image_url TEXT NOT NULL,
    hero_image_url TEXT,
    rating NUMERIC(3,2) DEFAULT 4.90 CHECK (rating >= 0 AND rating <= 5.00),
    reviews_count INT DEFAULT 0,
    starting_price_usd INT NOT NULL CHECK (starting_price_usd >= 0),
    duration_days INT DEFAULT 4,
    best_months JSONB DEFAULT '[]'::jsonb, -- Array of strings e.g. ["July", "August"]
    wildlife_highlights JSONB DEFAULT '[]'::jsonb, -- Array of strings
    big_five_probability JSONB NOT NULL DEFAULT '{"lion": 90, "leopard": 80, "elephant": 90, "rhino": 50, "buffalo": 90}'::jsonb,
    description TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb, -- Array of string experience highlights
    coordinates_lat NUMERIC(9,6) NOT NULL,
    coordinates_lng NUMERIC(9,6) NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    eco_score NUMERIC(3,1) DEFAULT 9.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast faceted searches
CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_price ON destinations(starting_price_usd);

-- -----------------------------------------------------------------------------
-- 2. DESTINATION GALLERY TABLE (Photo Management)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destination_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dest_gallery_dest_id ON destination_gallery(destination_id);

-- -----------------------------------------------------------------------------
-- 3. PARK INFORMATION TABLE (Fees, Rules, Ranger Contacts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destination_park_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) UNIQUE NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    entry_fee_usd INT NOT NULL DEFAULT 80,
    vehicle_fee_usd INT NOT NULL DEFAULT 40,
    operating_hours VARCHAR(128) DEFAULT '06:00 AM - 06:30 PM (Gates close strictly at dusk)',
    conservation_status VARCHAR(128) DEFAULT 'UNESCO World Heritage / National Reserve',
    total_area_sq_km INT DEFAULT 1510,
    rules JSONB DEFAULT '["Stay inside vehicles on game drives", "Speed limit 40 km/h strictly enforced", "No off-roading without special ranger permits", "Maintain 25m distance from big cats"]'::jsonb,
    ranger_contact VARCHAR(128) DEFAULT '+254 20 800 SAFARI',
    emergency_helpline VARCHAR(128) DEFAULT '+254 700 RANGER (999)',
    officialWebsite TEXT
);

-- -----------------------------------------------------------------------------
-- 4. DESTINATION WEATHER TABLE (Telemetry & Seasonality)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destination_weather (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) UNIQUE NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    current_temp_c INT DEFAULT 26,
    condition_text VARCHAR(128) DEFAULT 'Warm Savanna Sun & Gentle Breeze',
    low_temp_c INT DEFAULT 15,
    high_temp_c INT DEFAULT 29,
    humidity_percent INT DEFAULT 48,
    rainfall_mm INT DEFAULT 12,
    best_visiting_condition TEXT DEFAULT 'Dry season (July to October) yields highest game concentration around water sources.',
    monthly_forecast JSONB DEFAULT '[
        {"month": "Jan", "tempC": 28, "rainfall": "Low"},
        {"month": "Feb", "tempC": 29, "rainfall": "Low"},
        {"month": "Mar", "tempC": 27, "rainfall": "Moderate"},
        {"month": "Apr", "tempC": 25, "rainfall": "High"},
        {"month": "May", "tempC": 24, "rainfall": "Moderate"},
        {"month": "Jun", "tempC": 25, "rainfall": "Low"},
        {"month": "Jul", "tempC": 26, "rainfall": "Low"},
        {"month": "Aug", "tempC": 27, "rainfall": "Low"},
        {"month": "Sep", "tempC": 28, "rainfall": "Low"},
        {"month": "Oct", "tempC": 28, "rainfall": "Low"},
        {"month": "Nov", "tempC": 26, "rainfall": "Moderate"},
        {"month": "Dec", "tempC": 27, "rainfall": "Low"}
    ]'::jsonb
);

-- -----------------------------------------------------------------------------
-- 5. WILDLIFE INFORMATION TABLE (Species Sightings Probability)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destination_wildlife (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    species_name VARCHAR(128) NOT NULL,
    sighting_probability VARCHAR(32) CHECK (sighting_probability IN ('Guaranteed', 'High', 'Moderate', 'Seasonal', 'Rare')),
    probability_percentage INT CHECK (probability_percentage BETWEEN 0 AND 100),
    description TEXT,
    best_spotting_time VARCHAR(128) DEFAULT 'Early morning or late afternoon game drives'
);

CREATE INDEX IF NOT EXISTS idx_dest_wildlife_dest_id ON destination_wildlife(destination_id);

-- -----------------------------------------------------------------------------
-- 6. NEARBY ATTRACTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destination_nearby_attractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    attraction_type VARCHAR(64) NOT NULL,
    distance_km NUMERIC(5,1) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_dest_attractions_dest_id ON destination_nearby_attractions(destination_id);

-- -----------------------------------------------------------------------------
-- 7. TRAVEL TIPS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destination_travel_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Packing', 'Health & Visas', 'Etiquette', 'Best Photography', 'Safety')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dest_tips_dest_id ON destination_travel_tips(destination_id);

-- -----------------------------------------------------------------------------
-- 8. USER SAVED DESTINATIONS (FAVORITES)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_destinations (
    user_id VARCHAR(64) NOT NULL,
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, destination_id)
);

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
