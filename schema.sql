-- =============================================================================
-- IDENT AFRICA ECOSYSTEM - DESTINATION MANAGEMENT SYSTEM DATABASE SCHEMA
-- Target DB: PostgreSQL 14+ / Cloud SQL / Supabase
-- Version: 1.0.0
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 1. DESTINATIONS TABLE (Core Sanctuary / Park Registry)
-- =============================================================================
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
    reviews_count INT DEFAULT 0 CHECK (reviews_count >= 0),
    starting_price_usd INT NOT NULL CHECK (starting_price_usd >= 0),
    duration_days INT DEFAULT 4 CHECK (duration_days > 0),
    best_months JSONB DEFAULT '[]'::jsonb,
    wildlife_highlights JSONB DEFAULT '[]'::jsonb,
    big_five_probability JSONB NOT NULL DEFAULT '{"lion": 90, "leopard": 80, "elephant": 90, "rhino": 50, "buffalo": 90}'::jsonb,
    description TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    coordinates_lat NUMERIC(9,6) NOT NULL CHECK (coordinates_lat BETWEEN -90 AND 90),
    coordinates_lng NUMERIC(9,6) NOT NULL CHECK (coordinates_lng BETWEEN -180 AND 180),
    featured BOOLEAN DEFAULT FALSE,
    eco_score NUMERIC(3,1) DEFAULT 9.8 CHECK (eco_score >= 0 AND eco_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_destinations_updated_at
    BEFORE UPDATE ON destinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexing for fast faceted searches
CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_price ON destinations(starting_price_usd);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON destinations(rating DESC);
CREATE INDEX IF NOT EXISTS idx_destinations_country_featured ON destinations(country, featured) WHERE featured = TRUE;

-- =============================================================================
-- 2. DESTINATION GALLERY TABLE (Photo Management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS destination_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_image_url CHECK (image_url ~ '^https?://.*')
);

CREATE TRIGGER update_gallery_updated_at
    BEFORE UPDATE ON destination_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dest_gallery_dest_id ON destination_gallery(destination_id);
CREATE INDEX IF NOT EXISTS idx_dest_gallery_order ON destination_gallery(destination_id, display_order);

-- =============================================================================
-- 3. PARK INFORMATION TABLE (Fees, Rules, Ranger Contacts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS destination_park_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) UNIQUE NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    entry_fee_usd INT NOT NULL DEFAULT 80 CHECK (entry_fee_usd >= 0),
    vehicle_fee_usd INT NOT NULL DEFAULT 40 CHECK (vehicle_fee_usd >= 0),
    operating_hours VARCHAR(128) DEFAULT '06:00 AM - 06:30 PM (Gates close strictly at dusk)',
    conservation_status VARCHAR(128) DEFAULT 'UNESCO World Heritage / National Reserve',
    total_area_sq_km INT DEFAULT 1510 CHECK (total_area_sq_km > 0),
    rules JSONB DEFAULT '["Stay inside vehicles on game drives", "Speed limit 40 km/h strictly enforced", "No off-roading without special ranger permits", "Maintain 25m distance from big cats"]'::jsonb,
    ranger_contact VARCHAR(128) DEFAULT '+254 20 800 SAFARI',
    emergency_helpline VARCHAR(128) DEFAULT '+254 700 RANGER (999)',
    official_website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_park_info_updated_at
    BEFORE UPDATE ON destination_park_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. DESTINATION WEATHER TABLE (Telemetry & Seasonality)
-- =============================================================================
CREATE TABLE IF NOT EXISTS destination_weather (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) UNIQUE NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    current_temp_c INT DEFAULT 26 CHECK (current_temp_c BETWEEN -60 AND 60),
    condition_text VARCHAR(128) DEFAULT 'Warm Savanna Sun & Gentle Breeze',
    low_temp_c INT DEFAULT 15 CHECK (low_temp_c BETWEEN -60 AND 60),
    high_temp_c INT DEFAULT 29 CHECK (high_temp_c BETWEEN -60 AND 60),
    humidity_percent INT DEFAULT 48 CHECK (humidity_percent BETWEEN 0 AND 100),
    rainfall_mm INT DEFAULT 12 CHECK (rainfall_mm >= 0),
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
    ]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_weather_updated_at
    BEFORE UPDATE ON destination_weather
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. WILDLIFE INFORMATION TABLE (Species Sightings Probability)
-- =============================================================================
CREATE TABLE IF NOT EXISTS destination_wildlife (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    species_name VARCHAR(128) NOT NULL,
    sighting_probability VARCHAR(32) CHECK (sighting_probability IN ('Guaranteed', 'High', 'Moderate', 'Seasonal', 'Rare')),
    probability_percentage INT CHECK (probability_percentage BETWEEN 0 AND 100),
    description TEXT,
    best_spotting_time VARCHAR(128) DEFAULT 'Early morning or late afternoon game drives',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_wildlife_updated_at
    BEFORE UPDATE ON destination_wildlife
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dest_wildlife_dest_id ON destination_wildlife(destination_id);
CREATE INDEX IF NOT EXISTS idx_dest_wildlife_species ON destination_wildlife(species_name);

-- =============================================================================
-- 6. NEARBY ATTRACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS destination_nearby_attractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    attraction_type VARCHAR(64) NOT NULL,
    distance_km NUMERIC(5,1) NOT NULL CHECK (distance_km > 0),
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_attractions_updated_at
    BEFORE UPDATE ON destination_nearby_attractions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dest_attractions_dest_id ON destination_nearby_attractions(destination_id);

-- =============================================================================
-- 7. TRAVEL TIPS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS destination_travel_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Packing', 'Health & Visas', 'Etiquette', 'Best Photography', 'Safety')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_tips_updated_at
    BEFORE UPDATE ON destination_travel_tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dest_tips_dest_id ON destination_travel_tips(destination_id);
CREATE INDEX IF NOT EXISTS idx_dest_tips_category ON destination_travel_tips(category);

-- =============================================================================
-- 8. USER SAVED DESTINATIONS (FAVORITES)
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_destinations (
    user_id VARCHAR(64) NOT NULL,
    destination_id VARCHAR(64) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_destinations_user ON saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_destinations_dest ON saved_destinations(destination_id);

-- =============================================================================
-- 9. USERS TABLE (Authentication & Profile)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'admin', 'ranger_partner', 'supplier')),
    phone VARCHAR(64),
    avatar_url TEXT,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    dietary_preferences VARCHAR(255),
    passport_country VARCHAR(64),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =============================================================================
-- 10. BOOKINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref VARCHAR(32) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    destination_id VARCHAR(64) REFERENCES destinations(id) ON DELETE SET NULL,
    itinerary_id VARCHAR(64),
    traveler_name VARCHAR(255) NOT NULL,
    traveler_email VARCHAR(255) NOT NULL,
    traveler_phone VARCHAR(64),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    adults_count INT NOT NULL DEFAULT 1 CHECK (adults_count > 0),
    children_count INT DEFAULT 0 CHECK (children_count >= 0),
    total_price_usd DECIMAL(12,2) NOT NULL CHECK (total_price_usd >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Refund Requested')),
    payment_status VARCHAR(32) DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Deposit Paid', 'Paid in Full', 'Refunded')),
    payment_gateway VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_booking_dates CHECK (end_date >= start_date)
);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

-- =============================================================================
-- 10. SUPPLIERS TABLE (Future Production Use)
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('Hotel', 'Tour Operator', 'Transport Company', 'Guide')),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64) NOT NULL,
    country VARCHAR(64) NOT NULL CHECK (country IN ('Kenya', 'Tanzania', 'Uganda', 'Rwanda')),
    region VARCHAR(128) NOT NULL,
    approval_status VARCHAR(32) DEFAULT 'pending_approval' CHECK (approval_status IN ('pending_approval', 'approved', 'rejected', 'revisions_requested')),
    rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(approval_status);

-- =============================================================================
-- 11. LODGES TABLE (Hotels & Accommodations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS lodges (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    country VARCHAR(64) NOT NULL CHECK (country IN ('Kenya', 'Tanzania', 'Uganda', 'Rwanda')),
    region VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Luxury Lodge', 'Tented Camp', 'Boutique Hotel', 'Safari House', 'Treehouse')),
    image_url TEXT NOT NULL,
    hero_image_url TEXT,
    rating NUMERIC(3,2) DEFAULT 4.50 CHECK (rating >= 0 AND rating <= 5.00),
    reviews_count INT DEFAULT 0 CHECK (reviews_count >= 0),
    price_per_night_usd INT NOT NULL CHECK (price_per_night_usd >= 0),
    max_guests INT DEFAULT 4 CHECK (max_guests > 0),
    bedrooms INT DEFAULT 2 CHECK (bedrooms >= 0),
    bathrooms INT DEFAULT 2 CHECK (bathrooms >= 0),
    amenities JSONB DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    coordinates_lat NUMERIC(9,6) CHECK (coordinates_lat BETWEEN -90 AND 90),
    coordinates_lng NUMERIC(9,6) CHECK (coordinates_lng BETWEEN -180 AND 180),
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    supplier_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_lodges_updated_at
    BEFORE UPDATE ON lodges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_lodges_country ON lodges(country);
CREATE INDEX IF NOT EXISTS idx_lodges_category ON lodges(category);
CREATE INDEX IF NOT EXISTS idx_lodges_featured ON lodges(featured);
CREATE INDEX IF NOT EXISTS idx_lodges_price ON lodges(price_per_night_usd);
CREATE INDEX IF NOT EXISTS idx_lodges_rating ON lodges(rating DESC);

-- =============================================================================
-- 12. ITINERARIES TABLE (Safari Packages)
-- =============================================================================
CREATE TABLE IF NOT EXISTS itineraries (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    country VARCHAR(64) NOT NULL CHECK (country IN ('Kenya', 'Tanzania', 'Uganda', 'Rwanda')),
    region VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Classic Safari', 'Luxury Safari', 'Budget Safari', 'Adventure Safari', 'Honeymoon Safari', 'Family Safari')),
    duration_days INT NOT NULL CHECK (duration_days > 0),
    max_group_size INT DEFAULT 8 CHECK (max_group_size > 0),
    price_per_person_usd INT NOT NULL CHECK (price_per_person_usd >= 0),
    minimum_age INT DEFAULT 0 CHECK (minimum_age >= 0),
    image_url TEXT NOT NULL,
    hero_image_url TEXT,
    rating NUMERIC(3,2) DEFAULT 4.50 CHECK (rating >= 0 AND rating <= 5.00),
    reviews_count INT DEFAULT 0 CHECK (reviews_count >= 0),
    highlights JSONB DEFAULT '[]'::jsonb,
    included JSONB DEFAULT '[]'::jsonb,
    excluded JSONB DEFAULT '[]'::jsonb,
    itinerary_days JSONB DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    best_season VARCHAR(128) DEFAULT 'Year-round',
    difficulty VARCHAR(32) DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Moderate', 'Challenging')),
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_itineraries_country ON itineraries(country);
CREATE INDEX IF NOT EXISTS idx_itineraries_category ON itineraries(category);
CREATE INDEX IF NOT EXISTS idx_itineraries_duration ON itineraries(duration_days);
CREATE INDEX IF NOT EXISTS idx_itineraries_price ON itineraries(price_per_person_usd);
CREATE INDEX IF NOT EXISTS idx_itineraries_featured ON itineraries(featured);

-- =============================================================================
-- 13. BOOKING ADDONS TABLE (Optional Extras)
-- =============================================================================
CREATE TABLE IF NOT EXISTS booking_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_usd DECIMAL(10,2) NOT NULL CHECK (price_usd >= 0),
    price_type VARCHAR(32) DEFAULT 'per_booking' CHECK (price_type IN ('per_booking', 'per_person', 'per_day')),
    category VARCHAR(64) NOT NULL CHECK (category IN ('Transport', 'Insurance', 'Equipment', 'Experience', 'Meal', 'Accommodation', 'Other')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_booking_addons_updated_at
    BEFORE UPDATE ON booking_addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 14. PAYMENT TRANSACTIONS TABLE (Payment Tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    transaction_ref VARCHAR(128) UNIQUE NOT NULL,
    gateway VARCHAR(32) NOT NULL CHECK (gateway IN ('stripe', 'flutterwave', 'mpesa', 'bank_transfer', 'cash')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_payment_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_gateway ON payment_transactions(gateway);

-- =============================================================================
-- 15. BOOKING ADDONS JOIN TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS booking_selected_addons (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES booking_addons(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    price_at_booking DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (booking_id, addon_id)
);

-- =============================================================================
-- 16. AUDIT LOGS TABLE (Security & Compliance)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64),
    entity_id VARCHAR(64),
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================================================
-- 17. EMAIL VERIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_verif_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verif_user ON email_verifications(user_id);

-- =============================================================================
-- 18. PASSWORD RESET TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_resets(user_id);

-- =============================================================================
-- SEED DATA: Initial admin user
-- =============================================================================
-- Password: Admin@123 (should be changed immediately)
-- INSERT INTO users (id, email, password_hash, name, role, email_verified, is_active)
-- VALUES (
--     'admin-001',
--     'admin@identafrica.com',
--     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.4FxcGqhOOT/F5m', -- Admin@123
--     'System Administrator',
--     'admin',
--     true,
--     true
-- );

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

-- =============================================================================
-- CMS TABLES: Content Management System
-- =============================================================================

-- =============================================================================
-- 19. CMS HOMEPAGE TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_homepage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT false,
    updated_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_homepage_active ON cms_homepage(is_active) WHERE is_active = true;

-- =============================================================================
-- 20. CMS THEME TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_theme (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config JSONB NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- 21. CMS MEDIA TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt VARCHAR(255),
    caption TEXT,
    tags TEXT[] DEFAULT '{}',
    folder VARCHAR(255),
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_media_folder ON cms_media(folder);
CREATE INDEX IF NOT EXISTS idx_cms_media_tags ON cms_media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_cms_media_created ON cms_media(created_at DESC);

-- =============================================================================
-- 22. CMS ACCOMMODATION TABLE (extends lodges with CMS fields)
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_accommodation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lodge_id UUID REFERENCES lodges(id) ON DELETE CASCADE,
    custom_data JSONB,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    og_image TEXT,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- 23. CMS EXPERIENCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_data JSONB NOT NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_exp_destination ON cms_experiences(destination_id);
CREATE INDEX IF NOT EXISTS idx_cms_exp_featured ON cms_experiences(is_featured);

-- =============================================================================
-- 24. CMS PACKAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_data JSONB NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_pkg_featured ON cms_packages(is_featured);

-- =============================================================================
-- 25. CMS TESTIMONIALS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    safari_package VARCHAR(255),
    travel_date DATE,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_test_featured ON cms_testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_cms_test_active ON cms_testimonials(is_active);

-- =============================================================================
-- 26. CMS PARTNERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo TEXT NOT NULL,
    website TEXT,
    description TEXT,
    partner_type VARCHAR(50) CHECK (partner_type IN ('airline', 'hotel_chain', 'tour_operator', 'conservation', 'government', 'media')),
    tier VARCHAR(20) CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_partner_type ON cms_partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_cms_partner_tier ON cms_partners(tier);
CREATE INDEX IF NOT EXISTS idx_cms_partner_featured ON cms_partners(is_featured);

-- =============================================================================
-- END OF CMS TABLES
-- =============================================================================

-- =============================================================================
-- PAGE SECTIONS: Block-Based Page Builder
-- =============================================================================

-- =============================================================================
-- 27. PAGE SECTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page VARCHAR(50) NOT NULL CHECK (page IN ('homepage', 'destinations', 'accommodation', 'experiences', 'packages', 'about', 'contact')),
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero', 'destination', 'experience', 'hotel', 'package', 'gallery', 'testimonial', 'partner', 'cta')),
    content_json JSONB NOT NULL DEFAULT '{}',
    settings_json JSONB NOT NULL DEFAULT '{"visible": true}',
    display_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Ensure unique ordering per page
    CONSTRAINT unique_page_order UNIQUE (page, display_order)
);

-- Indexes for page_sections
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page);
CREATE INDEX IF NOT EXISTS idx_page_sections_type ON page_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_page_sections_visible ON page_sections(visible);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(page, display_order);

-- =============================================================================
-- PAGE SECTIONS AUDIT LOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS page_sections_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder', 'visibility')),
    old_content JSONB,
    new_content JSONB,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_audit_section ON page_sections_audit(section_id);
CREATE INDEX IF NOT EXISTS idx_page_audit_action ON page_sections_audit(action);
CREATE INDEX IF NOT EXISTS idx_page_audit_time ON page_sections_audit(changed_at DESC);

-- =============================================================================
-- FUNCTION: Auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_page_section_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_page_section_updated
    BEFORE UPDATE ON page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_page_section_timestamp();

-- =============================================================================
-- SEED: Default homepage blocks
-- =============================================================================
INSERT INTO page_sections (page, section_type, content_json, settings_json, display_order, visible, created_by)
VALUES 
    ('homepage', 'hero', 
     '{"title": "East Africa''s Finest Safari Expeditions", "subtitle": "Experience the wild heart of Africa with curated luxury expeditions across Kenya, Tanzania, Uganda & Rwanda", "ctaText": "Start Your Journey", "ctaLink": "/destinations", "backgroundImage": "", "overlayOpacity": 0.4, "alignment": "center", "minHeight": "full"}',
     '{"visible": true, "containerWidth": "full", "paddingTop": "none", "paddingBottom": "none"}',
     1, true, 'system'),
    ('homepage', 'destination',
     '{"title": "Featured Destinations", "subtitle": "Discover our most sought-after wildlife destinations", "layout": "grid", "columns": 3, "destinationIds": [], "showFilters": true, "limit": 6}',
     '{"visible": true, "containerWidth": "wide", "paddingTop": "lg", "paddingBottom": "lg"}',
     2, true, 'system'),
    ('homepage', 'experience',
     '{"title": "Unforgettable Experiences", "subtitle": "From mountain gorilla encounters to great migration spectacles", "layout": "grid", "columns": 3, "showViewAll": true, "viewAllLink": "/experiences"}',
     '{"visible": true, "containerWidth": "wide", "paddingTop": "lg", "paddingBottom": "lg", "backgroundColor": "#292524"}',
     3, true, 'system'),
    ('homepage', 'package',
     '{"title": "Curated Safari Packages", "subtitle": "Expertly designed expeditions for every type of traveler", "layout": "grid", "columns": 3, "showViewAll": true}',
     '{"visible": true, "containerWidth": "wide", "paddingTop": "lg", "paddingBottom": "lg"}',
     4, true, 'system'),
    ('homepage', 'testimonial',
     '{"title": "Traveler Stories", "subtitle": "Hear from those who''ve experienced the magic of East Africa", "layout": "slider", "showRating": true, "showAvatar": true, "autoPlay": true}',
     '{"visible": true, "containerWidth": "wide", "paddingTop": "lg", "paddingBottom": "lg", "backgroundColor": "#1C1917"}',
     5, true, 'system'),
    ('homepage', 'cta',
     '{"title": "Ready for Your Safari?", "subtitle": "Let us create your perfect African adventure", "buttonText": "Get Started", "buttonLink": "/contact", "buttonStyle": "primary", "alignment": "center"}',
     '{"visible": true, "containerWidth": "narrow", "paddingTop": "xl", "paddingBottom": "xl", "backgroundColor": "#F59E0B"}',
     6, true, 'system')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF PAGE SECTIONS
-- =============================================================================

-- =============================================================================
-- TRAVELER JOURNEY TABLE
-- Unified customer journey management
-- =============================================================================

CREATE TYPE journey_stage AS ENUM (
    'DISCOVERY',
    'PLANNING',
    'BOOKING',
    'PAYMENT',
    'PREPARATION',
    'TRAVEL',
    'POST_TRAVEL'
);

CREATE TYPE journey_status AS ENUM (
    'active',
    'completed',
    'abandoned',
    'cancelled'
);

CREATE TYPE entity_type AS ENUM (
    'destination',
    'package',
    'experience',
    'ai_plan',
    'booking',
    'payment',
    'review'
);

CREATE TABLE IF NOT EXISTS traveler_journey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL,
    stage journey_stage NOT NULL,
    entity_type entity_type NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    status journey_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    stage_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stage_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for common queries
    CONSTRAINT unique_user_stage_entity UNIQUE (user_id, stage, entity_id)
);

-- Indexes for performance
CREATE INDEX idx_journey_user_id ON traveler_journey(user_id);
CREATE INDEX idx_journey_stage ON traveler_journey(stage);
CREATE INDEX idx_journey_status ON traveler_journey(status);
CREATE INDEX idx_journey_entity ON traveler_journey(entity_type, entity_id);
CREATE INDEX idx_journey_created ON traveler_journey(created_at DESC);

-- Function to update journey updated_at
CREATE OR REPLACE FUNCTION update_journey_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_journey_updated
    BEFORE UPDATE ON traveler_journey
    FOR EACH ROW
    EXECUTE FUNCTION update_journey_timestamp();

-- Function to mark stage as completed
CREATE OR REPLACE FUNCTION complete_journey_stage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.stage_completed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complete_stage
    BEFORE UPDATE ON traveler_journey
    FOR EACH ROW
    EXECUTE FUNCTION complete_journey_stage();

-- =============================================================================
-- JOURNEY ANALYTICS TABLE
-- Track aggregated journey metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS journey_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL,
    destination_id VARCHAR(64),
    journey_started_at TIMESTAMP WITH TIME ZONE,
    booking_completed_at TIMESTAMP WITH TIME ZONE,
    travel_completed_at TIMESTAMP WITH TIME ZONE,
    days_to_booking INT,
    days_to_travel INT,
    total_value DECIMAL(12,2),
    conversion_source VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_analytics_destination ON journey_analytics(destination_id);
CREATE INDEX idx_analytics_conversion ON journey_analytics(conversion_source);

-- =============================================================================
-- END OF TRAVELER JOURNEY
-- =============================================================================

-- =============================================================================
-- PRICING RULES TABLE
-- Dynamic pricing management for packages and destinations
-- =============================================================================

CREATE TYPE pricing_rule_type AS ENUM (
    'base',
    'season',
    'weekend',
    'peak',
    'discount',
    'promotion',
    'early_bird',
    'last_minute',
    'group',
    'supplier_adjustment'
);

CREATE TYPE pricing_action AS ENUM (
    'add',
    'subtract',
    'multiply',
    'percentage'
);

CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id VARCHAR(128) NOT NULL,
    entity_type VARCHAR(32) NOT NULL CHECK (entity_type IN ('destination', 'package', 'experience')),
    
    -- Rule type
    rule_type pricing_rule_type NOT NULL,
    
    -- Price adjustment
    action pricing_action NOT NULL DEFAULT 'percentage',
    percentage_change DECIMAL(5,2) DEFAULT 0,
    fixed_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Conditions
    min_travelers INT DEFAULT 1,
    max_travelers INT,
    min_days_notice INT,
    is_weekend_only BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promo_code VARCHAR(32),
    priority INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(64),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Supplier pricing
    supplier_id VARCHAR(64),
    requires_supplier_approval BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_date_range CHECK (
        end_date IS NULL OR start_date IS NULL OR end_date > start_date
    ),
    CONSTRAINT valid_percentage CHECK (
        percentage_change >= -100 AND percentage_change <= 500
    )
);

-- Indexes
CREATE INDEX idx_pricing_entity ON pricing_rules(entity_type, entity_id);
CREATE INDEX idx_pricing_dates ON pricing_rules(start_date, end_date);
CREATE INDEX idx_pricing_active ON pricing_rules(is_active, is_approved);
CREATE INDEX idx_pricing_promo ON pricing_rules(promo_code) WHERE promo_code IS NOT NULL;
CREATE INDEX idx_pricing_supplier ON pricing_rules(supplier_id) WHERE supplier_id IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_pricing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pricing_updated
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_timestamp();

-- =============================================================================
-- PRICING SEASONS TABLE
-- Define standard pricing seasons
-- =============================================================================

CREATE TABLE IF NOT EXISTS pricing_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    season_type VARCHAR(32) NOT NULL CHECK (season_type IN ('peak', 'high', 'shoulder', 'low')),
    
    -- Date pattern (can be recurring annually)
    start_month INT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    start_day INT NOT NULL CHECK (start_day BETWEEN 1 AND 31),
    end_month INT NOT NULL CHECK (end_month BETWEEN 1 AND 12),
    end_day INT NOT NULL CHECK (end_day BETWEEN 1 AND 31),
    
    -- Price multiplier
    price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    
    -- Apply to all or specific entities
    applies_to_all BOOLEAN DEFAULT TRUE,
    entity_ids JSONB DEFAULT '[]'::jsonb,
    
    -- Region specific
    region VARCHAR(64),
    country VARCHAR(64),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seasons_type ON pricing_seasons(season_type);
CREATE INDEX idx_seasons_dates ON pricing_seasons(start_month, end_month);

CREATE TRIGGER trg_seasons_updated
    BEFORE UPDATE ON pricing_seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_timestamp();

-- Seed default seasons
INSERT INTO pricing_seasons (name, season_type, start_month, start_day, end_month, end_day, price_multiplier, region) VALUES
    ('Peak Season - Great Migration', 'peak', 6, 1, 10, 31, 1.50, 'East Africa'),
    ('High Season - End Year', 'high', 12, 15, 1, 15, 1.35, 'East Africa'),
    ('Shoulder Season - March-May', 'shoulder', 3, 1, 5, 31, 0.85, 'East Africa'),
    ('Low Season - Long Rains', 'low', 4, 1, 5, 31, 0.75, 'East Africa')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PROMOTIONAL CAMPAIGNS TABLE
-- Marketing campaigns with pricing rules
-- =============================================================================

CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    
    -- Campaign type
    campaign_type VARCHAR(32) NOT NULL CHECK (campaign_type IN ('flash_sale', 'seasonal', 'loyalty', 'referral', 'early_bird', 'last_minute')),
    
    -- Timing
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Discount configuration
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'tiered')),
    discount_value DECIMAL(12,2) NOT NULL,
    max_discount DECIMAL(12,2),
    min_purchase DECIMAL(12,2) DEFAULT 0,
    
    -- Targeting
    target_audience VARCHAR(32) DEFAULT 'all' CHECK (target_audience IN ('all', 'new_users', 'returning', 'vip', 'suppliers')),
    applicable_entities JSONB DEFAULT '[]'::jsonb,
    
    -- Limits
    max_uses INT,
    max_uses_per_user INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    
    -- Promo code
    promo_code VARCHAR(32) UNIQUE,
    is_auto_apply BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(16) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_dates ON promotional_campaigns(start_date, end_date);
CREATE INDEX idx_campaign_status ON promotional_campaigns(status);
CREATE INDEX idx_campaign_promo ON promotional_campaigns(promo_code) WHERE promo_code IS NOT NULL;

CREATE TRIGGER trg_campaign_updated
    BEFORE UPDATE ON promotional_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_timestamp();

-- =============================================================================
-- CAMPAIGN REDEMPTIONS TABLE
-- Track promo code usage
-- =============================================================================

CREATE TABLE IF NOT EXISTS campaign_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(128),
    
    promo_code VARCHAR(32) NOT NULL,
    discount_applied DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_campaign UNIQUE (campaign_id, user_id, booking_id)
);

CREATE INDEX idx_redemption_campaign ON campaign_redemptions(campaign_id);
CREATE INDEX idx_redemption_user ON campaign_redemptions(user_id);

-- =============================================================================
-- END OF PRICING
-- =============================================================================

-- =============================================================================
-- INVENTORY MANAGEMENT
-- Real-time availability system for accommodations, transport, guides, activities
-- =============================================================================

-- Inventory item types
CREATE TYPE inventory_item_type AS ENUM (
    'room',
    'seat',
    'vehicle',
    'guide',
    'activity'
);

-- Inventory status
CREATE TYPE inventory_status AS ENUM (
    'available',
    'reserved',
    'booked',
    'blocked'
);

-- Main inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Inventory identification
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id VARCHAR(128) NOT NULL,
    product_type inventory_item_type NOT NULL,
    
    -- Capacity
    total_quantity INT NOT NULL CHECK (total_quantity > 0),
    
    -- Availability tracking
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    blocked_quantity INT NOT NULL DEFAULT 0 CHECK (blocked_quantity >= 0),
    
    -- Date range (NULL means always available)
    valid_from DATE,
    valid_to DATE,
    
    -- Metadata
    name VARCHAR(255),
    description TEXT,
    unit_type VARCHAR(32) DEFAULT 'unit', -- 'room', 'seat', 'person', 'vehicle', 'session'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_quantity CHECK (available_quantity + reserved_quantity + blocked_quantity <= total_quantity)
);

CREATE INDEX idx_inventory_supplier ON inventory(supplier_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_type ON inventory(product_type);
CREATE INDEX idx_inventory_dates ON inventory(valid_from, valid_to);

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Daily inventory snapshot for booking dates
CREATE TABLE IF NOT EXISTS inventory_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Date
    date DATE NOT NULL,
    
    -- Quantities for specific date
    total_quantity INT NOT NULL,
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    blocked_quantity INT NOT NULL DEFAULT 0 CHECK (blocked_quantity >= 0),
    
    -- Status
    status inventory_status DEFAULT 'available',
    
    -- Price override (optional)
    price_override DECIMAL(12,2),
    min_stay INT DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_daily_quantity CHECK (available_quantity + reserved_quantity + blocked_quantity <= total_quantity),
    CONSTRAINT unique_inventory_date UNIQUE (inventory_id, date)
);

CREATE INDEX idx_inventory_daily_inventory ON inventory_daily(inventory_id);
CREATE INDEX idx_inventory_daily_date ON inventory_daily(date);
CREATE INDEX idx_inventory_daily_status ON inventory_daily(status);
CREATE INDEX idx_inventory_daily_lookup ON inventory_daily(inventory_id, date);

CREATE TRIGGER update_inventory_daily_updated_at
    BEFORE UPDATE ON inventory_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory reservations (for booking holds)
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    daily_id UUID REFERENCES inventory_daily(id) ON DELETE SET NULL,
    
    -- Reservation details
    booking_id VARCHAR(128),
    session_id VARCHAR(128), -- For cart holds
    quantity INT NOT NULL CHECK (quantity > 0),
    
    -- Status
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'released')),
    
    -- Timing
    reservation_start TIMESTAMP WITH TIME ZONE NOT NULL,
    reservation_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Hold expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_reservation_dates CHECK (reservation_end > reservation_start)
);

CREATE INDEX idx_reservations_inventory ON inventory_reservations(inventory_id);
CREATE INDEX idx_reservations_daily ON inventory_reservations(daily_id);
CREATE INDEX idx_reservations_status ON inventory_reservations(status);
CREATE INDEX idx_reservations_session ON inventory_reservations(session_id);
CREATE INDEX idx_reservations_booking ON inventory_reservations(booking_id);
CREATE INDEX idx_reservations_expiry ON inventory_reservations(expires_at) WHERE status = 'pending';

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON inventory_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory blocks (for maintenance, closures)
CREATE TABLE IF NOT EXISTS inventory_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Block details
    reason VARCHAR(128),
    block_type VARCHAR(32) DEFAULT 'maintenance' CHECK (block_type IN ('maintenance', 'closure', 'event', 'other')),
    
    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Quantity blocked
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_block_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_blocks_inventory ON inventory_blocks(inventory_id);
CREATE INDEX idx_blocks_dates ON inventory_blocks(start_date, end_date);
CREATE INDEX idx_blocks_active ON inventory_blocks(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_blocks_updated_at
    BEFORE UPDATE ON inventory_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- END OF INVENTORY
-- =============================================================================

-- =============================================================================
-- NOTIFICATIONS & MESSAGING SYSTEM
-- Multi-channel notifications: Email, SMS, WhatsApp, Push
-- =============================================================================

-- Notification channels
CREATE TYPE notification_channel AS ENUM (
    'email',
    'sms',
    'whatsapp',
    'push'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'booking_confirmation',
    'booking_cancellation',
    'payment_received',
    'payment_failed',
    'booking_reminder',
    'supplier_message',
    'admin_message',
    'promotion',
    'system_alert',
    'review_request'
);

-- Notification status
CREATE TYPE notification_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed',
    'read'
);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template identification
    name VARCHAR(128) NOT NULL UNIQUE,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    
    -- Template content
    subject VARCHAR(255),
    template_body TEXT NOT NULL,
    template_variables JSONB DEFAULT '[]',
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_type ON notification_templates(type);
CREATE INDEX idx_templates_channel ON notification_templates(channel);
CREATE INDEX idx_templates_active ON notification_templates(is_active);

CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notifications log
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient
    recipient_id VARCHAR(64) NOT NULL,
    recipient_type VARCHAR(32) NOT NULL, -- 'customer', 'supplier', 'admin'
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(32),
    
    -- Notification details
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    
    -- Data
    metadata JSONB DEFAULT '{}',
    related_entity_type VARCHAR(64),
    related_entity_id VARCHAR(128),
    
    -- Status tracking
    status notification_status DEFAULT 'pending',
    status_details TEXT,
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Retry tracking
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_related ON notifications(related_entity_type, related_entity_id);

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Messages (for conversations between users, suppliers, admins)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Conversation
    conversation_id VARCHAR(64) NOT NULL,
    
    -- Sender
    sender_id VARCHAR(64) NOT NULL,
    sender_type VARCHAR(32) NOT NULL, -- 'customer', 'supplier', 'admin'
    sender_name VARCHAR(255),
    
    -- Recipient
    recipient_id VARCHAR(64),
    recipient_type VARCHAR(32),
    
    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(32) DEFAULT 'text', -- 'text', 'system', 'booking_update'
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    related_entity_type VARCHAR(64),
    related_entity_id VARCHAR(128),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User
    user_id VARCHAR(64) NOT NULL,
    user_type VARCHAR(32) NOT NULL, -- 'customer', 'supplier', 'admin'
    
    -- Device info
    token VARCHAR(512) NOT NULL,
    device_type VARCHAR(32), -- 'ios', 'android', 'web'
    device_name VARCHAR(128),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_token UNIQUE (user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id, user_type);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Email subscriptions (for marketing)
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Preferences
    subscribed BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    preferences JSONB DEFAULT '{"promotions": true, "newsletter": true, "booking_updates": true}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_subscriptions_active ON email_subscriptions(subscribed) WHERE subscribed = TRUE;

-- =============================================================================
-- END OF NOTIFICATIONS
-- =============================================================================

-- =============================================================================
-- COMMUNICATION CENTER
-- Centralized communication with workflow triggers
-- =============================================================================

-- Conversation types
CREATE TYPE conversation_type AS ENUM (
    'customer_admin',
    'customer_supplier',
    'supplier_admin',
    'support',
    'booking_inquiry',
    'booking_chat'
);

-- Conversation status
CREATE TYPE conversation_status AS ENUM (
    'active',
    'resolved',
    'archived',
    'pending'
);

-- Dedicated conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Conversation identification
    conversation_type conversation_type NOT NULL,
    conversation_code VARCHAR(64) UNIQUE NOT NULL,
    
    -- Participants (for quick reference)
    participant_a_id VARCHAR(64),
    participant_a_type VARCHAR(32), -- 'customer', 'supplier', 'admin'
    participant_a_name VARCHAR(255),
    
    participant_b_id VARCHAR(64),
    participant_b_type VARCHAR(32),
    participant_b_name VARCHAR(255),
    
    -- Subject/topic
    subject VARCHAR(255),
    
    -- Related entity
    related_entity_type VARCHAR(64), -- 'booking', 'payment', 'product'
    related_entity_id VARCHAR(128),
    
    -- Status
    status conversation_status DEFAULT 'active',
    
    -- Last activity
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    
    -- Counts
    unread_count_a INT DEFAULT 0,
    unread_count_b INT DEFAULT 0,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(64),
    resolution_note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_code ON conversations(conversation_code);
CREATE INDEX idx_conversations_type ON conversations(conversation_type);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_participant_a ON conversations(participant_a_id, participant_a_type);
CREATE INDEX idx_conversations_participant_b ON conversations(participant_b_id, participant_b_type);
CREATE INDEX idx_conversations_related ON conversations(related_entity_type, related_entity_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Communication workflow triggers
CREATE TYPE workflow_trigger_type AS ENUM (
    'booking_created',
    'booking_confirmed',
    'booking_cancelled',
    'payment_received',
    'payment_failed',
    'travel_reminder',
    'check_in_reminder',
    'review_request',
    'refund_initiated',
    'refund_completed'
);

-- Communication workflow status
CREATE TYPE workflow_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'skipped'
);

-- Communication workflow triggers
CREATE TABLE IF NOT EXISTS communication_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Trigger information
    trigger_type workflow_trigger_type NOT NULL,
    trigger_entity_type VARCHAR(64) NOT NULL, -- 'booking', 'payment'
    trigger_entity_id VARCHAR(128) NOT NULL,
    
    -- Channel configuration
    channels JSONB NOT NULL DEFAULT '["email"]', -- ["email", "sms", "whatsapp", "push"]
    
    -- Recipients
    recipient_id VARCHAR(64) NOT NULL,
    recipient_type VARCHAR(32) NOT NULL, -- 'customer', 'supplier', 'admin'
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(32),
    
    -- Message content
    subject VARCHAR(255),
    message_template VARCHAR(64), -- Reference to template
    message_variables JSONB DEFAULT '{}',
    
    -- Notification records
    notifications JSONB DEFAULT '[]', -- Array of notification IDs created
    
    -- Status
    status workflow_status DEFAULT 'pending',
    status_details TEXT,
    attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_trigger ON communication_workflows(trigger_type, trigger_entity_type, trigger_entity_id);
CREATE INDEX idx_workflows_recipient ON communication_workflows(recipient_id, recipient_type);
CREATE INDEX idx_workflows_status ON communication_workflows(status);
CREATE INDEX idx_workflows_scheduled ON communication_workflows(scheduled_for) WHERE status = 'pending';

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON communication_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update messages table to reference conversations
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS is_system_message BOOLEAN DEFAULT FALSE;

-- Create index on messages for conversation lookup
CREATE INDEX IF NOT EXISTS idx_messages_conversation_new ON messages(conversation_id);

-- Communication channel preferences (per user)
CREATE TABLE IF NOT EXISTS communication_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User
    user_id VARCHAR(64) NOT NULL,
    user_type VARCHAR(32) NOT NULL, -- 'customer', 'supplier', 'admin'
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    
    -- Notification type preferences
    booking_updates BOOLEAN DEFAULT TRUE,
    payment_alerts BOOLEAN DEFAULT TRUE,
    promotional_messages BOOLEAN DEFAULT FALSE,
    travel_reminders BOOLEAN DEFAULT TRUE,
    system_alerts BOOLEAN DEFAULT TRUE,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(32) DEFAULT 'UTC',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_preferences UNIQUE (user_id, user_type)
);

CREATE INDEX idx_preferences_user ON communication_preferences(user_id, user_type);

CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON communication_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Communication templates for workflows
CREATE TABLE IF NOT EXISTS communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template identification
    name VARCHAR(128) NOT NULL UNIQUE,
    trigger_type workflow_trigger_type,
    channel notification_channel NOT NULL,
    
    -- Template content
    subject_template VARCHAR(255),
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    
    -- Channels this template applies to
    applies_to JSONB DEFAULT '["email"]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_trigger ON communication_templates(trigger_type);
CREATE INDEX idx_templates_channel ON communication_templates(channel);
CREATE INDEX idx_templates_active ON communication_templates(is_active);

CREATE TRIGGER update_communication_templates_updated_at
    BEFORE UPDATE ON communication_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- END OF COMMUNICATION CENTER
-- =============================================================================

-- =============================================================================
-- DOCUMENT MANAGEMENT SYSTEM
-- Generate, store, and manage travel documents
-- =============================================================================

-- Document types
CREATE TYPE document_type AS ENUM (
    'booking_confirmation',
    'invoice',
    'safari_itinerary',
    'travel_checklist',
    'supplier_voucher',
    'travel_insurance',
    'visa_confirmation',
    'flight_ticket',
    'hotel_voucher',
    'other'
);

-- Document status
CREATE TYPE document_status AS ENUM (
    'draft',
    'generated',
    'sent',
    'viewed',
    'expired'
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Document identification
    document_type document_type NOT NULL,
    document_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Related entities
    booking_id VARCHAR(128),
    customer_id VARCHAR(64),
    supplier_id VARCHAR(64),
    
    -- File information
    file_name VARCHAR(255),
    file_path VARCHAR(512),
    file_size BIGINT,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    
    -- Document content (JSON for dynamic content)
    content JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Status
    status document_status DEFAULT 'draft',
    
    -- Access tracking
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    last_downloaded_by VARCHAR(64),
    
    -- Delivery tracking
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_to_email VARCHAR(255),
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Generation info
    generated_by VARCHAR(64), -- 'system' or user_id
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_number ON documents(document_number);
CREATE INDEX idx_documents_booking ON documents(booking_id);
CREATE INDEX idx_documents_customer ON documents(customer_id);
CREATE INDEX idx_documents_supplier ON documents(supplier_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Document access log
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Document reference
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Access info
    accessed_by VARCHAR(64) NOT NULL,
    accessed_by_type VARCHAR(32), -- 'customer', 'supplier', 'admin'
    access_type VARCHAR(32) NOT NULL, -- 'view', 'download', 'email', 'print'
    
    -- IP and device info
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    
    -- Timestamp
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_log_document ON document_access_log(document_id);
CREATE INDEX idx_access_log_user ON document_access_log(accessed_by);
CREATE INDEX idx_access_log_time ON document_access_log(accessed_at DESC);

-- Document templates
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template identification
    name VARCHAR(128) NOT NULL UNIQUE,
    document_type document_type NOT NULL,
    description TEXT,
    
    -- Template content
    template_content TEXT NOT NULL, -- HTML/template content
    styles CSS DEFAULT '',
    
    -- Variables that can be used in the template
    variables JSONB DEFAULT '[]',
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Versioning
    version INT DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_type ON document_templates(document_type);
CREATE INDEX idx_templates_active ON document_templates(is_active);

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Document generation queue (for async generation)
CREATE TABLE IF NOT EXISTS document_generation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request info
    document_type document_type NOT NULL,
    booking_id VARCHAR(128),
    customer_id VARCHAR(64),
    
    -- Parameters
    parameters JSONB DEFAULT '{}',
    
    -- Priority
    priority INT DEFAULT 0,
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    status_details TEXT,
    
    -- Result
    document_id UUID,
    error_message TEXT,
    
    -- Timing
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generation_queue_status ON document_generation_queue(status);
CREATE INDEX idx_generation_queue_scheduled ON document_generation_queue(scheduled_for) WHERE status = 'pending';

-- Document share links (temporary access)
CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Document reference
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Share info
    share_token VARCHAR(128) UNIQUE NOT NULL,
    share_url VARCHAR(512),
    
    -- Access restrictions
    allowed_emails JSONB DEFAULT '[]', -- Array of emails that can access
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(256),
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    max_views INT,
    
    -- Tracking
    view_count INT DEFAULT 0,
    
    created_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shares_token ON document_shares(share_token);
CREATE INDEX idx_shares_document ON document_shares(document_id);

-- Insert default document templates
INSERT INTO document_templates (name, document_type, description, template_content, variables, is_default) VALUES
(
    'Booking Confirmation',
    'booking_confirmation',
    'Standard booking confirmation document',
    '<!DOCTYPE html>
<html>
<head>
    <title>Booking Confirmation - {{booking_number}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #C89A4B; padding-bottom: 20px; }
        .confirmation-number { font-size: 24px; color: #C89A4B; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; color: #2E2015; border-bottom: 1px solid #C89A4B; padding-bottom: 5px; }
        .detail-row { display: flex; margin: 5px 0; }
        .detail-label { width: 150px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>IDENT AFRICA</h1>
        <p>Booking Confirmation</p>
        <p class="confirmation-number">{{confirmation_number}}</p>
    </div>
    <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="detail-row"><span class="detail-label">Booking Number:</span> {{booking_number}}</div>
        <div class="detail-row"><span class="detail-label">Destination:</span> {{destination}}</div>
        <div class="detail-row"><span class="detail-label">Travel Date:</span> {{travel_date}}</div>
        <div class="detail-row"><span class="detail-label">Duration:</span> {{duration}}</div>
    </div>
    <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="detail-row"><span class="detail-label">Name:</span> {{customer_name}}</div>
        <div class="detail-row"><span class="detail-label">Email:</span> {{customer_email}}</div>
        <div class="detail-row"><span class="detail-label">Phone:</span> {{customer_phone}}</div>
    </div>
    <div class="section">
        <div class="section-title">Package Details</div>
        {{package_details}}
    </div>
    <div class="footer">
        <p>Generated by IDENT AFRICA | Contact: support@ident.africa</p>
        <p>This document is your official booking confirmation. Please keep it safe.</p>
    </div>
</body>
</html>',
    '["booking_number", "destination", "travel_date", "duration", "customer_name", "customer_email", "customer_phone", "package_details"]',
    TRUE
),
(
    'Safari Itinerary',
    'safari_itinerary',
    'Detailed safari day-by-day itinerary',
    '<!DOCTYPE html>
<html>
<head>
    <title>Safari Itinerary - {{booking_number}}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #C89A4B; }
        h1 { color: #2E2015; }
        .day { margin: 30px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #C89A4B; }
        .day-number { color: #C89A4B; font-weight: bold; }
        .activity { margin: 10px 0; padding-left: 20px; }
        .time { font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>IDENT AFRICA SAFARI</h1>
        <h2>Your Safari Itinerary</h2>
        <p>{{booking_number}}</p>
    </div>
    <div class="customer-info">
        <p><strong>Traveler:</strong> {{customer_name}}</p>
        <p><strong>Destination:</strong> {{destination}}</p>
        <p><strong>Duration:</strong> {{duration}}</p>
    </div>
    {{itinerary_days}}
    <div class="footer">
        <p>Emergency Contact: +254 700 123 456</p>
        <p>Your Safari Guide will contact you 24 hours before departure.</p>
    </div>
</body>
</html>',
    '["booking_number", "customer_name", "destination", "duration", "itinerary_days"]',
    TRUE
),
(
    'Travel Checklist',
    'travel_checklist',
    'Pre-travel checklist for customers',
    '<!DOCTYPE html>
<html>
<head>
    <title>Travel Checklist - {{booking_number}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .checklist-item { padding: 10px; border-bottom: 1px solid #eee; }
        .checkbox { width: 20px; height: 20px; border: 2px solid #C89A4B; display: inline-block; margin-right: 10px; }
        .section { margin: 20px 0; }
        .section-title { background: #C89A4B; color: white; padding: 10px; }
    </style>
</head>
<body>
    <h1>Travel Checklist</h1>
    <p>Booking: {{booking_number}}</p>
    <p>Travel Date: {{travel_date}}</p>
    
    <div class="section">
        <div class="section-title">Documents</div>
        <div class="checklist-item"><span class="checkbox"></span>Valid Passport (6+ months validity)</div>
        <div class="checklist-item"><span class="checkbox"></span>Visa (if required)</div>
        <div class="checklist-item"><span class="checkbox"></span>Booking Confirmation</div>
        <div class="checklist-item"><span class="checkbox"></span>Travel Insurance</div>
    </div>
    
    <div class="section">
        <div class="section-title">Essentials</div>
        <div class="checklist-item"><span class="checkbox"></span>Medications</div>
        <div class="checklist-item"><span class="checkbox"></span>Phone & Charger</div>
        <div class="checklist-item"><span class="checkbox"></span>Currency / Cards</div>
    </div>
</body>
</html>',
    '["booking_number", "travel_date"]',
    TRUE
);

-- =============================================================================
-- END OF DOCUMENT MANAGEMENT
-- =============================================================================

-- =============================================================================
-- LOYALTY PROGRAM SYSTEM
-- Customer rewards and membership management
-- =============================================================================

-- Membership levels
CREATE TYPE membership_tier AS ENUM (
    'bronze',
    'silver',
    'gold',
    'platinum',
    'diamond'
);

-- Points transaction types
CREATE TYPE points_transaction_type AS ENUM (
    'booking_earn',
    'review_earn',
    'referral_earn',
    'promotion_earn',
    'signup_bonus',
    'redemption',
    'expired',
    'adjustment'
);

-- Loyalty program status
CREATE TYPE loyalty_status AS ENUM (
    'active',
    'suspended',
    'expired',
    'cancelled'
);

-- Customer loyalty profiles
CREATE TABLE IF NOT EXISTS loyalty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Customer reference
    customer_id VARCHAR(64) NOT NULL UNIQUE,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    
    -- Membership info
    membership_tier membership_tier DEFAULT 'bronze',
    tier_achieved_at TIMESTAMP WITH TIME ZONE,
    
    -- Points
    current_points INT DEFAULT 0,
    lifetime_points INT DEFAULT 0,
    points_to_next_tier INT,
    
    -- Spending
    total_spending NUMERIC(12, 2) DEFAULT 0,
    total_bookings INT DEFAULT 0,
    
    -- Status
    status loyalty_status DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Benefits
    benefits JSONB DEFAULT '[]',
    
    -- Preferences
    preferences JSONB DEFAULT '{"notifications": true, "exclusive_offers": true}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loyalty_customer ON loyalty_profiles(customer_id);
CREATE INDEX idx_loyalty_tier ON loyalty_profiles(membership_tier);
CREATE INDEX idx_loyalty_status ON loyalty_profiles(status);
CREATE INDEX idx_loyalty_points ON loyalty_profiles(current_points DESC);

CREATE TRIGGER update_loyalty_profiles_updated_at
    BEFORE UPDATE ON loyalty_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Membership levels configuration
CREATE TABLE IF NOT EXISTS membership_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Level info
    tier membership_tier NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    
    -- Thresholds
    min_lifetime_points INT DEFAULT 0,
    min_total_spending NUMERIC(12, 2) DEFAULT 0,
    min_bookings INT DEFAULT 0,
    
    -- Benefits
    points_multiplier NUMERIC(3, 2) DEFAULT 1.0, -- e.g., 1.5 = 50% bonus
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    free_upgrades BOOLEAN DEFAULT FALSE,
    priority_booking BOOLEAN DEFAULT FALSE,
    exclusive_access BOOLEAN DEFAULT FALSE,
    dedicated_support BOOLEAN DEFAULT FALSE,
    
    -- Benefits list (JSON for flexibility)
    benefits JSONB DEFAULT '[]',
    
    -- Visual
    color VARCHAR(7) DEFAULT '#C89A4B', -- Hex color for UI
    icon VARCHAR(64),
    
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default membership levels
INSERT INTO membership_levels (tier, name, description, min_lifetime_points, min_total_spending, min_bookings, points_multiplier, discount_percentage, color, sort_order) VALUES
('bronze', 'Bronze Member', 'Welcome to IDENT AFRICA Rewards!', 0, 0, 0, 1.0, 0, '#CD7F32', 1),
('silver', 'Silver Member', 'Enjoy 10% bonus points on all bookings', 1000, 500, 3, 1.1, 2, '#C0C0C0', 2),
('gold', 'Gold Member', 'Get 20% bonus points and 5% discount', 5000, 2500, 10, 1.2, 5, '#FFD700', 3),
('platinum', 'Platinum Member', 'Premium benefits with 30% bonus points', 15000, 7500, 25, 1.3, 8, '#E5E4E2', 4),
('diamond', 'Diamond Member', 'VIP treatment with exclusive experiences', 50000, 25000, 50, 1.5, 12, '#B9F2FF', 5)
ON CONFLICT (tier) DO NOTHING;

-- Points transactions
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    loyalty_profile_id UUID NOT NULL REFERENCES loyalty_profiles(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL,
    
    -- Transaction details
    transaction_type points_transaction_type NOT NULL,
    points INT NOT NULL, -- Positive for earn, negative for redeem
    balance_after INT NOT NULL, -- Points balance after this transaction
    
    -- Source reference
    booking_id VARCHAR(128),
    review_id VARCHAR(128),
    referral_id VARCHAR(128),
    promotion_id VARCHAR(128),
    
    -- Description
    description TEXT,
    details JSONB DEFAULT '{}',
    
    -- Expiry
    points_expire_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(32) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'expired'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_profile ON points_transactions(loyalty_profile_id);
CREATE INDEX idx_transactions_customer ON points_transactions(customer_id);
CREATE INDEX idx_transactions_type ON points_transactions(transaction_type);
CREATE INDEX idx_transactions_booking ON points_transactions(booking_id);
CREATE INDEX idx_transactions_created ON points_transactions(created_at DESC);
CREATE INDEX idx_transactions_expiry ON points_transactions(points_expire_at) WHERE status = 'completed' AND points > 0;

-- Customer reviews for loyalty points
CREATE TABLE IF NOT EXISTS review_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Review reference
    review_id VARCHAR(128) NOT NULL UNIQUE,
    booking_id VARCHAR(128) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    
    -- Review details
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Points awarded
    points_awarded INT DEFAULT 0,
    points_transaction_id UUID REFERENCES points_transactions(id),
    
    -- Bonus for excellent reviews
    bonus_eligible BOOLEAN DEFAULT FALSE,
    bonus_points INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_rewards_customer ON review_rewards(customer_id);
CREATE INDEX idx_review_rewards_booking ON review_rewards(booking_id);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referrer (existing customer)
    referrer_id VARCHAR(64) NOT NULL REFERENCES loyalty_profiles(id) ON DELETE CASCADE,
    referrer_email VARCHAR(255),
    referrer_name VARCHAR(255),
    
    -- Referral code
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referral_link VARCHAR(512),
    
    -- Referred customer
    referred_id VARCHAR(64),
    referred_email VARCHAR(255),
    referred_name VARCHAR(255),
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'registered', 'booked', 'completed', 'expired'
    
    -- Points
    referrer_points_awarded INT DEFAULT 0,
    referred_points_awarded INT DEFAULT 0,
    
    -- References
    signup_transaction_id UUID REFERENCES points_transactions(id),
    booking_transaction_id UUID REFERENCES points_transactions(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Promotions and bonus point campaigns
CREATE TABLE IF NOT EXISTS loyalty_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Promotion info
    name VARCHAR(128) NOT NULL,
    description TEXT,
    code VARCHAR(32) UNIQUE,
    
    -- Type
    promotion_type VARCHAR(32) NOT NULL, -- 'bonus_points', 'multiplier', 'double_points', 'tier_bonus'
    
    -- Value
    bonus_points INT DEFAULT 0,
    points_multiplier NUMERIC(3, 2) DEFAULT 1.0,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    
    -- Conditions
    min_booking_value NUMERIC(12, 2) DEFAULT 0,
    applicable_tiers membership_tier[], -- Which tiers can use this
    applicable_destinations JSONB DEFAULT '[]',
    
    -- Validity
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP WITH TIME ZONE,
    max_uses INT,
    current_uses INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_code ON loyalty_promotions(code);
CREATE INDEX idx_promotions_active ON loyalty_promotions(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON loyalty_promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Points redemption rewards catalog
CREATE TABLE IF NOT EXISTS redemption_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reward info
    name VARCHAR(128) NOT NULL,
    description TEXT,
    category VARCHAR(64), -- 'discount', 'experience', 'upgrade', 'merchandise'
    
    -- Points cost
    points_cost INT NOT NULL,
    
    -- Value
    value_amount NUMERIC(12, 2), -- Monetary value if applicable
    value_type VARCHAR(32), -- 'fixed', 'percentage', 'experience'
    
    -- Requirements
    min_tier membership_tier,
    requires_booking BOOLEAN DEFAULT FALSE,
    
    -- Availability
    quantity INT, -- NULL = unlimited
    redeemed_count INT DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rewards_category ON redemption_rewards(category);
CREATE INDEX idx_rewards_tier ON redemption_rewards(min_tier);
CREATE INDEX idx_rewards_active ON redemption_rewards(is_active);

CREATE TRIGGER update_rewards_updated_at
    BEFORE UPDATE ON redemption_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Points redemptions log
CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    customer_id VARCHAR(64) NOT NULL,
    loyalty_profile_id UUID NOT NULL REFERENCES loyalty_profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES redemption_rewards(id),
    
    -- Booking reference (if applicable)
    booking_id VARCHAR(128),
    
    -- Points
    points_spent INT NOT NULL,
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'approved', 'fulfilled', 'cancelled'
    redemption_code VARCHAR(32),
    
    -- Fulfillment
    voucher_code VARCHAR(64),
    voucher_url VARCHAR(512),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    fulfilled_by VARCHAR(64),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_redemptions_customer ON redemptions(customer_id);
CREATE INDEX idx_redemptions_reward ON redemptions(reward_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);

CREATE TRIGGER update_redemptions_updated_at
    BEFORE UPDATE ON redemptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default redemption rewards
INSERT INTO redemption_rewards (name, description, category, points_cost, value_amount, value_type, requires_booking, is_featured) VALUES
('10% Booking Discount', 'Get 10% off your next booking', 'discount', 500, 10, 'percentage', TRUE, TRUE),
('Safari Upgrade', 'Upgrade to premium safari experience', 'upgrade', 2000, 200, 'fixed', TRUE, TRUE),
('Exclusive Dinner', 'Private dinner experience in the savanna', 'experience', 5000, 500, 'fixed', FALSE, TRUE),
('Free Night Stay', 'Complimentary night at partner lodge', 'experience', 3000, 300, 'fixed', TRUE, FALSE),
('Equipment Rental', 'Free camera/safari equipment rental', 'merchandise', 250, 50, 'fixed', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF LOYALTY PROGRAM
-- =============================================================================
