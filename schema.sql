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
