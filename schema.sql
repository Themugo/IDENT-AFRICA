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
    CONSTRAINT valid_image_url CHECK (image_url ~ '^https?://.*' OR image_url ~ '^data:' OR image_url ~ '^/.*' OR image_url ~ '^\./.*')
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
    itinerary_id VARCHAR(64) REFERENCES itineraries(id) ON DELETE SET NULL,
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    hotel_id VARCHAR(64) REFERENCES lodges(id) ON DELETE SET NULL,
    traveler_name VARCHAR(255) NOT NULL,
    traveler_email VARCHAR(255) NOT NULL,
    traveler_phone VARCHAR(64),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    adults_count INT NOT NULL DEFAULT 1 CHECK (adults_count > 0),
    children_count INT DEFAULT 0 CHECK (children_count >= 0),
    total_price_usd DECIMAL(12,2) NOT NULL CHECK (total_price_usd >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Pending Approval', 'Confirmed', 'In Progress', 'Completed', 'Declined', 'Cancelled', 'Refund Requested', 'Refunded')),
    payment_status VARCHAR(32) DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Deposit Paid', 'Deposit Paid (30%)', 'Paid in Full', 'Escrow Secured', 'Refund Pending', 'Refunded')),
    payment_gateway VARCHAR(32) CHECK (payment_gateway IN ('Stripe', 'Flutterwave', 'M-Pesa', 'PayPal', 'Bank Wire', 'stripe', 'flutterwave', 'mpesa', 'paypal', 'bank_transfer', 'cash') OR payment_gateway IS NULL),
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
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_destination ON bookings(destination_id);
CREATE INDEX IF NOT EXISTS idx_bookings_itinerary ON bookings(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_bookings_supplier ON bookings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

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
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_lodges_supplier ON lodges(supplier_id);
CREATE INDEX IF NOT EXISTS idx_lodges_active_featured ON lodges(is_active, featured);

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
    gateway VARCHAR(32) NOT NULL CHECK (gateway IN ('stripe', 'flutterwave', 'mpesa', 'paypal', 'bank_transfer', 'cash', 'Stripe', 'Flutterwave', 'M-Pesa', 'PayPal', 'Bank Wire')),
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
CREATE INDEX IF NOT EXISTS idx_payment_created ON payment_transactions(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_unique_gateway_tx ON payment_transactions(gateway, gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;

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

-- =============================================================================
-- SUPPLIER QUALITY SCORING SYSTEM
-- Supplier performance tracking and badge assignment
-- =============================================================================

-- Badge types
CREATE TYPE badge_type AS ENUM (
    'verified_luxury',
    'top_safari',
    'eco_champion',
    'super_host',
    'rising_star',
    'premium_partner',
    'trusted_supplier',
    'excellence_award'
);

-- Supplier quality scores
CREATE TABLE IF NOT EXISTS supplier_quality_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier reference
    supplier_id VARCHAR(64) NOT NULL UNIQUE,
    
    -- Overall score (0-100)
    overall_score NUMERIC(5, 2) DEFAULT 0,
    score_grade VARCHAR(2), -- A+, A, A-, B+, B, B-, C, D
    
    -- Individual metrics (0-100 each)
    rating_score NUMERIC(5, 2) DEFAULT 0, -- Customer ratings
    response_time_score NUMERIC(5, 2) DEFAULT 0, -- Response time metric
    completion_rate_score NUMERIC(5, 2) DEFAULT 0, -- Booking completion
    satisfaction_score NUMERIC(5, 2) DEFAULT 0, -- Customer satisfaction
    cancellation_rate_score NUMERIC(5, 2) DEFAULT 100, -- Inverse (100 = no cancellations)
    
    -- Metrics breakdown
    total_ratings INT DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    avg_response_time_minutes INT DEFAULT 0,
    booking_completion_rate NUMERIC(5, 2) DEFAULT 0,
    customer_satisfaction_rate NUMERIC(5, 2) DEFAULT 0,
    cancellation_rate NUMERIC(5, 2) DEFAULT 0,
    
    -- Counts
    total_bookings INT DEFAULT 0,
    completed_bookings INT DEFAULT 0,
    cancelled_bookings INT DEFAULT 0,
    total_responses INT DEFAULT 0,
    
    -- Badges earned
    badges badge_type[] DEFAULT '{}',
    primary_badge badge_type,
    
    -- Period tracking
    period_start DATE DEFAULT CURRENT_DATE,
    period_end DATE,
    
    -- Last updated
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quality_supplier ON supplier_quality_scores(supplier_id);
CREATE INDEX idx_quality_score ON supplier_quality_scores(overall_score DESC);
CREATE INDEX idx_quality_badges ON supplier_quality_scores USING GIN(badges);

CREATE TRIGGER update_quality_updated_at
    BEFORE UPDATE ON supplier_quality_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Quality metrics history
CREATE TABLE IF NOT EXISTS quality_metrics_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier reference
    supplier_id VARCHAR(64) NOT NULL,
    
    -- Metric type
    metric_type VARCHAR(64) NOT NULL, -- 'rating', 'response_time', 'completion', 'satisfaction', 'cancellation'
    
    -- Values
    value NUMERIC(10, 4) NOT NULL,
    previous_value NUMERIC(10, 4),
    
    -- Booking reference (if applicable)
    booking_id VARCHAR(128),
    
    -- Period
    recorded_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_history_supplier ON quality_metrics_history(supplier_id);
CREATE INDEX idx_metrics_history_type ON quality_metrics_history(metric_type);
CREATE INDEX idx_metrics_history_date ON quality_metrics_history(recorded_date DESC);

-- Badge definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Badge info
    badge_type badge_type NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    icon VARCHAR(64), -- Icon name or emoji
    
    -- Criteria
    criteria JSONB NOT NULL, -- JSON criteria for earning badge
    
    -- Requirements example:
    -- {
    --   "verified_luxury": {
    --     "min_overall_score": 90,
    --     "min_rating": 4.8,
    --     "required_badges": ["trusted_supplier"]
    --   }
    -- }
    
    -- Thresholds
    min_overall_score INT DEFAULT 0,
    min_rating NUMERIC(3, 2) DEFAULT 0,
    min_completion_rate NUMERIC(5, 2) DEFAULT 0,
    max_cancellation_rate NUMERIC(5, 2) DEFAULT 100,
    min_bookings INT DEFAULT 0,
    min_responses INT DEFAULT 0,
    
    -- Display
    color VARCHAR(7) DEFAULT '#C89A4B',
    bg_color VARCHAR(7) DEFAULT 'rgba(200, 154, 75, 0.1)',
    
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default badge definitions
INSERT INTO badge_definitions (badge_type, name, description, icon, color, bg_color, min_overall_score, min_rating, min_completion_rate, max_cancellation_rate, min_bookings, sort_order, criteria) VALUES
(
    'trusted_supplier',
    'Trusted Supplier',
    'Consistently high performance with excellent reviews',
    '✅',
    '#22C55E',
    'rgba(34, 197, 94, 0.1)',
    75, 4.0, 90, 5, 20, 1,
    '{"min_overall_score": 75, "min_rating": 4.0, "min_completion_rate": 90, "max_cancellation_rate": 5}'
),
(
    'verified_luxury',
    'Verified Luxury Partner',
    'Premium service meeting luxury standards',
    '💎',
    '#8B5CF6',
    'rgba(139, 92, 246, 0.1)',
    90, 4.8, 95, 2, 50, 2,
    '{"min_overall_score": 90, "min_rating": 4.8, "min_completion_rate": 95, "max_cancellation_rate": 2}'
),
(
    'top_safari',
    'Top Safari Provider',
    'Top-rated safari and wildlife experience provider',
    '🦁',
    '#F59E0B',
    'rgba(245, 158, 11, 0.1)',
    80, 4.5, 85, 8, 30, 3,
    '{"min_overall_score": 80, "min_rating": 4.5, "category": "safari"}'
),
(
    'eco_champion',
    'Eco Champion',
    'Recognized for sustainable and eco-friendly practices',
    '🌿',
    '#10B981',
    'rgba(16, 185, 129, 0.1)',
    70, 4.0, 85, 10, 15, 4,
    '{"min_overall_score": 70, "sustainable_practices": true}'
),
(
    'super_host',
    'Super Host',
    'Exceptional host with outstanding hospitality',
    '⭐',
    '#FBBF24',
    'rgba(251, 191, 36, 0.1)',
    95, 4.9, 98, 1, 100, 5,
    '{"min_overall_score": 95, "min_rating": 4.9, "min_completion_rate": 98, "max_cancellation_rate": 1, "min_bookings": 100}'
),
(
    'rising_star',
    'Rising Star',
    'New supplier showing excellent potential',
    '🌟',
    '#3B82F6',
    'rgba(59, 130, 246, 0.1)',
    65, 4.2, 80, 10, 5, 6,
    '{"min_overall_score": 65, "min_rating": 4.2, "min_bookings": 5, "max_age_days": 180}'
),
(
    'premium_partner',
    'Premium Partner',
    'Exclusive partner with premium services',
    '👑',
    '#EC4899',
    'rgba(236, 72, 153, 0.1)',
    88, 4.7, 93, 3, 75, 7,
    '{"min_overall_score": 88, "min_rating": 4.7, "min_completion_rate": 93, "max_cancellation_rate": 3, "min_bookings": 75}'
),
(
    'excellence_award',
    'Excellence Award',
    'Highest achievement in service excellence',
    '🏆',
    '#DC2626',
    'rgba(220, 38, 38, 0.1)',
    98, 5.0, 99, 0.5, 200, 8,
    '{"min_overall_score": 98, "min_rating": 5.0, "min_completion_rate": 99, "max_cancellation_rate": 0.5, "min_bookings": 200}'
)
ON CONFLICT (badge_type) DO NOTHING;

-- Supplier rating reviews
CREATE TABLE IF NOT EXISTS supplier_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier and booking
    supplier_id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(128) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    
    -- Overall rating (1-5)
    overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    
    -- Individual aspects (1-5)
    service_rating INT CHECK (service_rating >= 1 AND service_rating <= 5),
    value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
    cleanliness_rating INT CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    location_rating INT CHECK (location_rating >= 1 AND location_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- Review
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Response from supplier
    supplier_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'hidden'
    
    -- Verified stay
    is_verified_stay BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_supplier ON supplier_ratings(supplier_id);
CREATE INDEX idx_ratings_booking ON supplier_ratings(booking_id);
CREATE INDEX idx_ratings_customer ON supplier_ratings(customer_id);
CREATE INDEX idx_ratings_status ON supplier_ratings(status);

CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON supplier_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Response time tracking
CREATE TABLE IF NOT EXISTS response_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier reference
    supplier_id VARCHAR(64) NOT NULL,
    
    -- Inquiry/booking
    inquiry_type VARCHAR(64) NOT NULL, -- 'booking_inquiry', 'booking_request', 'message', 'support'
    related_id VARCHAR(128), -- booking_id or inquiry_id
    
    -- Timing
    inquiry_received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    first_response_at TIMESTAMP WITH TIME ZONE,
    response_time_minutes INT,
    
    -- Status
    responded BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_response_supplier ON response_time_logs(supplier_id);
CREATE INDEX idx_response_date ON response_time_logs(inquiry_received_at DESC);

-- Quality alerts
CREATE TABLE IF NOT EXISTS quality_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier reference
    supplier_id VARCHAR(64) NOT NULL,
    
    -- Alert info
    alert_type VARCHAR(64) NOT NULL, -- 'low_rating', 'slow_response', 'high_cancellation', 'complaint'
    severity VARCHAR(32) DEFAULT 'info', -- 'info', 'warning', 'critical'
    
    -- Details
    title VARCHAR(255),
    description TEXT,
    metric_affected VARCHAR(64),
    current_value NUMERIC(10, 4),
    threshold_value NUMERIC(10, 4),
    
    -- Resolution
    status VARCHAR(32) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'dismissed'
    resolved_by VARCHAR(64),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_supplier ON quality_alerts(supplier_id);
CREATE INDEX idx_alerts_status ON quality_alerts(status);
CREATE INDEX idx_alerts_severity ON quality_alerts(severity);

CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON quality_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- END OF SUPPLIER QUALITY SCORING
-- =============================================================================

-- =============================================================================
-- SUSTAINABILITY & ECO TRAVEL SYSTEM
-- Environmental impact tracking and sustainability scoring
-- =============================================================================

-- Sustainability score types
CREATE TYPE sustainability_category AS ENUM (
    'conservation',
    'community',
    'wildlife',
    'carbon',
    'overall'
);

-- Eco badge types
CREATE TYPE eco_badge_type AS ENUM (
    'carbon_neutral',
    'eco_certified',
    'community_support',
    'wildlife_friendly',
    'green_partner',
    'sustainable_leader',
    'plastic_free',
    'renewable_energy',
    'waste_reducer',
    'water_saver'
);

-- Supplier sustainability profiles
CREATE TABLE IF NOT EXISTS supplier_sustainability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier reference
    supplier_id VARCHAR(64) NOT NULL UNIQUE,
    
    -- Overall sustainability score (0-100)
    overall_score NUMERIC(5, 2) DEFAULT 0,
    sustainability_grade VARCHAR(2), -- A, B, C, D
    
    -- Category scores (0-100 each)
    conservation_score NUMERIC(5, 2) DEFAULT 0,
    community_score NUMERIC(5, 2) DEFAULT 0,
    wildlife_score NUMERIC(5, 2) DEFAULT 0,
    carbon_score NUMERIC(5, 2) DEFAULT 0,
    
    -- Eco badges
    eco_badges eco_badge_type[] DEFAULT '{}',
    primary_eco_badge eco_badge_type,
    
    -- Carbon metrics
    total_carbon_offset_kg NUMERIC(12, 2) DEFAULT 0,
    monthly_carbon_saved_kg NUMERIC(12, 2) DEFAULT 0,
    carbon_neutral BOOLEAN DEFAULT FALSE,
    
    -- Conservation impact
    conservation_projects INT DEFAULT 0,
    acres_protected NUMERIC(12, 2) DEFAULT 0,
    animals_protected INT DEFAULT 0,
    trees_planted INT DEFAULT 0,
    
    -- Community impact
    community_projects INT DEFAULT 0,
    local_employees INT DEFAULT 0,
    local_sourcing_percentage NUMERIC(5, 2) DEFAULT 0,
    community_investment_usd NUMERIC(12, 2) DEFAULT 0,
    
    -- Wildlife protection
    anti_poaching_partnership BOOLEAN DEFAULT FALSE,
    wildlife_corridors_maintained BOOLEAN DEFAULT FALSE,
    habitat_restoration_sq_km NUMERIC(10, 2) DEFAULT 0,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATE,
    last_audit_date DATE,
    next_audit_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sustainability_supplier ON supplier_sustainability(supplier_id);
CREATE INDEX idx_sustainability_score ON supplier_sustainability(overall_score DESC);
CREATE INDEX idx_sustainability_carbon_neutral ON supplier_sustainability(carbon_neutral) WHERE carbon_neutral = TRUE;

CREATE TRIGGER update_sustainability_updated_at
    BEFORE UPDATE ON supplier_sustainability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Conservation projects
CREATE TABLE IF NOT EXISTS conservation_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Project info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64), -- 'wildlife', 'forest', 'marine', 'community'
    
    -- Location
    location VARCHAR(255),
    country VARCHAR(64),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    
    -- Impact metrics
    area_sq_km NUMERIC(12, 2),
    target_species JSONB DEFAULT '[]',
    current_population INT,
    
    -- Funding
    funding_goal_usd NUMERIC(12, 2),
    funding_received_usd NUMERIC(12, 2) DEFAULT 0,
    funding_source VARCHAR(64), -- 'supplier', 'customer', 'donation'
    
    -- Partner info
    partner_organization VARCHAR(255),
    partner_url VARCHAR(512),
    
    -- Status
    status VARCHAR(32) DEFAULT 'active', -- 'planning', 'active', 'completed', 'paused'
    start_date DATE,
    end_date DATE,
    
    -- Tracking
    impact_metrics JSONB DEFAULT '{}', -- Flexible JSON for various metrics
    progress_percentage NUMERIC(5, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conservation_supplier ON conservation_projects USING GIN(target_species);
CREATE INDEX idx_conservation_category ON conservation_projects(category);
CREATE INDEX idx_conservation_status ON conservation_projects(status);
CREATE INDEX idx_conservation_location ON conservation_projects(country);

CREATE TRIGGER update_conservation_updated_at
    BEFORE UPDATE ON conservation_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Supplier conservation contributions
CREATE TABLE IF NOT EXISTS supplier_conservation_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    supplier_id VARCHAR(64) NOT NULL,
    project_id UUID REFERENCES conservation_projects(id) ON DELETE CASCADE,
    
    -- Contribution details
    contribution_type VARCHAR(64) NOT NULL, -- 'financial', 'volunteer', 'equipment', 'awareness'
    amount_usd NUMERIC(12, 2),
    description TEXT,
    
    -- Impact
    impact_description TEXT,
    impact_value NUMERIC(12, 2), -- e.g., acres protected, animals saved
    
    -- Status
    status VARCHAR(32) DEFAULT 'confirmed',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contributions_supplier ON supplier_conservation_contributions(supplier_id);
CREATE INDEX idx_contributions_project ON supplier_conservation_contributions(project_id);

-- Carbon footprint tracking
CREATE TABLE IF NOT EXISTS carbon_footprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    booking_id VARCHAR(128) NOT NULL,
    supplier_id VARCHAR(64),
    customer_id VARCHAR(64),
    
    -- Transport emissions (kg CO2)
    transport_type VARCHAR(64), -- 'flight', 'car', 'train', 'boat'
    transport_distance_km NUMERIC(10, 2),
    transport_emissions_kg NUMERIC(10, 2),
    
    -- Accommodation emissions
    accommodation_nights INT,
    accommodation_emissions_kg NUMERIC(10, 2),
    
    -- Activity emissions
    activity_emissions_kg NUMERIC(10, 2) DEFAULT 0,
    
    -- Totals
    total_emissions_kg NUMERIC(10, 2) NOT NULL,
    offset_cost_usd NUMERIC(10, 2),
    
    -- Offset tracking
    is_offset BOOLEAN DEFAULT FALSE,
    offset_project_id UUID REFERENCES conservation_projects(id),
    offset_certificate_id VARCHAR(128),
    
    -- Travel type
    trip_type VARCHAR(32) DEFAULT 'standard', -- 'standard', 'low_carbon', 'eco'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carbon_booking ON carbon_footprints(booking_id);
CREATE INDEX idx_carbon_supplier ON carbon_footprints(supplier_id);
CREATE INDEX idx_carbon_offset ON carbon_footprints(is_offset) WHERE is_offset = TRUE;

-- Carbon emission factors
CREATE TABLE IF NOT EXISTS carbon_emission_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Factor info
    transport_type VARCHAR(64) NOT NULL,
    vehicle_type VARCHAR(64),
    
    -- Emission factor
    emission_factor NUMERIC(10, 4) NOT NULL, -- kg CO2 per unit
    unit VARCHAR(32) NOT NULL, -- 'km', 'hour', 'person-km'
    
    -- Source
    source_name VARCHAR(128),
    source_url VARCHAR(512),
    last_updated DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default emission factors
INSERT INTO carbon_emission_factors (transport_type, vehicle_type, emission_factor, unit, source_name) VALUES
('flight', 'economy_short', 0.255, 'person-km', 'ICAO'),
('flight', 'economy_long', 0.195, 'person-km', 'ICAO'),
('flight', 'business', 0.510, 'person-km', 'ICAO'),
('car', 'petrol_small', 0.171, 'km', 'DEFRA'),
('car', 'petrol_large', 0.222, 'km', 'DEFRA'),
('car', 'diesel_small', 0.171, 'km', 'DEFRA'),
('car', 'diesel_large', 0.222, 'km', 'DEFRA'),
('car', 'electric', 0.053, 'km', 'DEFRA'),
('train', 'electric', 0.041, 'person-km', 'DEFRA'),
('train', 'diesel', 0.089, 'person-km', 'DEFRA'),
('bus', 'diesel', 0.089, 'person-km', 'DEFRA'),
('boat', 'ferry', 0.115, 'person-km', 'DEFRA'),
('boat', 'cruise', 0.250, 'person-km', 'DEFRA')
ON CONFLICT DO NOTHING;

-- Wildlife protection initiatives
CREATE TABLE IF NOT EXISTS wildlife_initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Initiative info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    initiative_type VARCHAR(64), -- 'anti_poaching', 'habitat', 'rescue', 'research'
    
    -- Location
    location VARCHAR(255),
    country VARCHAR(64),
    
    -- Species focus
    target_species JSONB DEFAULT '[]',
    species_list VARCHAR(255)[],
    
    -- Impact
    animals_protected INT DEFAULT 0,
    patrol_km INT DEFAULT 0,
    arrests_made INT DEFAULT 0,
    
    -- Partners
    partner_name VARCHAR(255),
    partner_type VARCHAR(64), -- 'ngo', 'government', 'community'
    
    -- Status
    status VARCHAR(32) DEFAULT 'active',
    start_year INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wildlife_species ON wildlife_initiatives USING GIN(species_list);
CREATE INDEX idx_wildlife_location ON wildlife_initiatives(country);
CREATE INDEX idx_wildlife_type ON wildlife_initiatives(initiative_type);

CREATE TRIGGER update_wildlife_updated_at
    BEFORE UPDATE ON wildlife_initiatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Community impact tracking
CREATE TABLE IF NOT EXISTS community_impacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    supplier_id VARCHAR(64) NOT NULL,
    
    -- Impact type
    impact_type VARCHAR(64) NOT NULL, -- 'employment', 'education', 'infrastructure', 'healthcare', 'arts'
    project_name VARCHAR(255),
    description TEXT,
    
    -- Beneficiaries
    beneficiaries_count INT DEFAULT 0,
    local_community_name VARCHAR(255),
    
    -- Investment
    investment_usd NUMERIC(12, 2) DEFAULT 0,
    in_kind_contribution TEXT,
    
    -- Ongoing
    is_ongoing BOOLEAN DEFAULT FALSE,
    
    -- Metrics
    metrics JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_supplier ON community_impacts(supplier_id);
CREATE INDEX idx_community_type ON community_impacts(impact_type);

CREATE TRIGGER update_community_updated_at
    BEFORE UPDATE ON community_impacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Eco badge definitions
CREATE TABLE IF NOT EXISTS eco_badge_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Badge info
    badge_type eco_badge_type NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    icon VARCHAR(64),
    
    -- Criteria
    criteria JSONB NOT NULL,
    
    -- Thresholds
    min_overall_score INT DEFAULT 0,
    min_category_score NUMERIC(5, 2) DEFAULT 0,
    required_practices JSONB DEFAULT '[]',
    prohibited_practices JSONB DEFAULT '[]',
    
    -- Display
    color VARCHAR(7) DEFAULT '#10B981',
    bg_color VARCHAR(7) DEFAULT 'rgba(16, 185, 129, 0.1)',
    
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert eco badge definitions
INSERT INTO eco_badge_definitions (badge_type, name, description, icon, color, bg_color, min_overall_score, criteria, sort_order) VALUES
(
    'eco_certified',
    'Eco Certified',
    'Verified sustainable travel provider',
    '🌿',
    '#10B981',
    'rgba(16, 185, 129, 0.1)',
    70,
    '{"min_overall_score": 70, "is_verified": true}',
    1
),
(
    'carbon_neutral',
    'Carbon Neutral',
    'Net zero carbon emissions',
    '☁️',
    '#06B6D4',
    'rgba(6, 182, 212, 0.1)',
    85,
    '{"carbon_neutral": true, "min_carbon_score": 85}',
    2
),
(
    'community_support',
    'Community Champion',
    'Strong community investment and support',
    '🤝',
    '#8B5CF6',
    'rgba(139, 92, 246, 0.1)',
    65,
    '{"min_community_score": 65, "min_community_investment": 1000}',
    3
),
(
    'wildlife_friendly',
    'Wildlife Friendly',
    'Verified wildlife protection practices',
    '🦁',
    '#F59E0B',
    'rgba(245, 158, 11, 0.1)',
    70,
    '{"min_wildlife_score": 70, "anti_poaching_partnership": true}',
    4
),
(
    'green_partner',
    'Green Partner',
    'Environmentally responsible operations',
    '♻️',
    '#22C55E',
    'rgba(34, 197, 94, 0.1)',
    60,
    '{"min_conservation_score": 60}',
    5
),
(
    'sustainable_leader',
    'Sustainable Leader',
    'Excellence in sustainable tourism',
    '🏆',
    '#EAB308',
    'rgba(234, 179, 8, 0.1)',
    90,
    '{"min_overall_score": 90, "is_verified": true, "carbon_neutral": true}',
    6
),
(
    'plastic_free',
    'Plastic Free',
    'Committed to eliminating single-use plastics',
    '🚫',
    '#3B82F6',
    'rgba(59, 130, 246, 0.1)',
    50,
    '{"plastic_free_initiatives": true}',
    7
),
(
    'renewable_energy',
    'Renewable Energy',
    'Powered by renewable energy sources',
    '⚡',
    '#FBBF24',
    'rgba(251, 191, 36, 0.1)',
    55,
    '{"renewable_energy_usage": true, "min_percentage": 75}',
    8
),
(
    'waste_reducer',
    'Waste Reducer',
    'Excellent waste management and reduction',
    '🗑️',
    '#84CC16',
    'rgba(132, 204, 22, 0.1)',
    50,
    '{"waste_reduction_program": true, "recycling_rate": 75}',
    9
),
(
    'water_saver',
    'Water Saver',
    'Responsible water management',
    '💧',
    '#0EA5E9',
    'rgba(14, 165, 233, 0.1)',
    50,
    '{"water_conservation": true, "min_efficiency_score": 70}',
    10
)
ON CONFLICT (badge_type) DO NOTHING;

-- Sustainability filters for booking
CREATE TYPE sustainability_filter AS ENUM (
    'eco_certified',
    'carbon_neutral',
    'community_support',
    'wildlife_friendly',
    'local_sourcing',
    'renewable_energy',
    'plastic_free',
    'low_carbon_transport'
);

-- =============================================================================
-- END OF SUSTAINABILITY SYSTEM
-- =============================================================================

-- =============================================================================
-- AUTOMATION ENGINE
-- Event-driven workflow automation system
-- =============================================================================

-- Event types
CREATE TYPE automation_event_type AS ENUM (
    -- User events
    'user.registered',
    'user.login',
    'user.logout',
    'user.profile_updated',
    
    -- Content events
    'destination.viewed',
    'destination.created',
    'destination.updated',
    'destination.deleted',
    'package.saved',
    'package.viewed',
    'itinerary.created',
    'itinerary.updated',
    'content.updated',
    
    -- Booking events
    'booking.created',
    'booking.updated',
    'booking.cancelled',
    'booking.confirmed',
    'booking.completed',
    
    -- Payment events
    'payment.initiated',
    'payment.completed',
    'payment.failed',
    'payment.refunded',
    'payment.partially_refunded',
    'commission.calculated',
    'commission.paid',
    
    -- Supplier events
    'supplier.registered',
    'supplier.approved',
    'supplier.rejected',
    'supplier.suspended',
    'supplier.package_created',
    'supplier.booking_received',
    
    -- Review events
    'review.submitted',
    'review.approved',
    'review.rejected',
    
    -- Document events
    'document.generated',
    'document.sent',
    'document.viewed',
    'document.downloaded',
    
    -- Loyalty events
    'loyalty.points_earned',
    'loyalty.points_redeemed',
    'loyalty.tier_upgraded',
    
    -- Notification events
    'notification.sent',
    'notification.viewed',
    'email.sent',
    'email.opened',
    
    -- Analytics events
    'analytics.page_view',
    'analytics.search',
    'analytics.filter_applied',
    'analytics.booking_started',
    'analytics.checkout_started'
);

-- Action types
CREATE TYPE automation_action_type AS ENUM (
    'send_email',
    'send_notification',
    'update_status',
    'generate_document',
    'notify_supplier',
    'webhook',
    'slack_message',
    'sms',
    'loyalty_award'
);

-- Workflow status
CREATE TYPE workflow_status AS ENUM (
    'active',
    'paused',
    'disabled'
);

-- Trigger status
CREATE TYPE trigger_status AS ENUM (
    'active',
    'paused',
    'disabled'
);

-- Workflow definitions
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Workflow info
    name VARCHAR(128) NOT NULL,
    description TEXT,
    
    -- Trigger
    trigger_event automation_event_type NOT NULL,
    trigger_conditions JSONB DEFAULT '{}', -- Conditions for when to fire
    
    -- Actions (sequence)
    actions JSONB NOT NULL, -- Array of action definitions
    
    -- Example structure:
    -- [
    --   {"type": "send_email", "template": "booking_confirm", "to": "{{customer.email}}"},
    --   {"type": "send_notification", "message": "New booking: {{booking.id}}"},
    --   {"type": "generate_document", "document_type": "booking_confirmation", "entity_id": "{{booking.id}}"}
    -- ]
    
    -- Status
    status workflow_status DEFAULT 'active',
    
    -- Priority (lower = higher priority)
    priority INT DEFAULT 100,
    
    -- Execution settings
    max_retries INT DEFAULT 3,
    retry_delay_seconds INT DEFAULT 60,
    timeout_seconds INT DEFAULT 300,
    
    -- Filters
    entity_type VARCHAR(64), -- Only trigger for specific entity types
    
    -- Stats
    trigger_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_event ON workflows(trigger_event);
CREATE INDEX idx_workflows_status ON workflows(status);

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Event log (all events that have occurred)
CREATE TABLE IF NOT EXISTS automation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event info
    event_type automation_event_type NOT NULL,
    
    -- Entity reference
    entity_type VARCHAR(64) NOT NULL, -- 'booking', 'payment', 'supplier', 'review'
    entity_id VARCHAR(128) NOT NULL,
    
    -- Event data
    payload JSONB DEFAULT '{}', -- Full event payload
    
    -- Triggered workflows
    triggered_workflows JSONB DEFAULT '[]', -- Array of workflow IDs that were triggered
    
    -- Status
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON automation_events(event_type);
CREATE INDEX idx_events_entity ON automation_events(entity_type, entity_id);
CREATE INDEX idx_events_processed ON automation_events(processed) WHERE processed = FALSE;
CREATE INDEX idx_events_created ON automation_events(created_at DESC);

-- Workflow execution logs
CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Workflow reference
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    workflow_name VARCHAR(128),
    
    -- Event reference
    event_id UUID REFERENCES automation_events(id) ON DELETE SET NULL,
    
    -- Execution info
    execution_id VARCHAR(128) UNIQUE NOT NULL,
    
    -- Entity context
    entity_type VARCHAR(64),
    entity_id VARCHAR(128),
    
    -- Action being executed
    action_index INT,
    action_type automation_action_type,
    action_config JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed', 'retrying'
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INT,
    
    -- Result
    result JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    
    -- Request/Response for webhooks
    request_body JSONB,
    response_body JSONB,
    response_status INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_workflow ON workflow_logs(workflow_id);
CREATE INDEX idx_logs_event ON workflow_logs(event_id);
CREATE INDEX idx_logs_status ON workflow_logs(status);
CREATE INDEX idx_logs_execution ON workflow_logs(execution_id);
CREATE INDEX idx_logs_created ON workflow_logs(created_at DESC);

CREATE TRIGGER update_workflow_logs_updated_at
    BEFORE UPDATE ON workflow_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template info
    name VARCHAR(128) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT,
    body_text TEXT,
    
    -- Template variables
    variables JSONB DEFAULT '[]', -- List of variable names
    
    -- For use with events
    default_for_event automation_event_type,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body_html, body_text, variables, default_for_event) VALUES
(
    'booking_confirmation',
    'Booking Confirmed - {{booking_reference}}',
    '<h1>Booking Confirmed!</h1><p>Dear {{customer_name}},</p><p>Your booking {{booking_reference}} has been confirmed.</p>',
    'Booking Confirmed!\n\nDear {{customer_name}},\n\nYour booking {{booking_reference}} has been confirmed.',
    '["customer_name", "booking_reference", "booking_date", "safari_name"]',
    'booking.created'
),
(
    'payment_receipt',
    'Payment Received - {{booking_reference}}',
    '<h1>Payment Receipt</h1><p>Thank you for your payment of {{amount}} {{currency}}.</p>',
    'Payment Received\n\nThank you for your payment of {{amount}} {{currency}}.',
    '["customer_name", "booking_reference", "amount", "currency", "payment_date"]',
    'payment.completed'
),
(
    'supplier_approval',
    'Supplier Application Approved',
    '<h1>Congratulations!</h1><p>Your supplier application has been approved.</p>',
    'Congratulations!\n\nYour supplier application has been approved.',
    '["supplier_name", "approved_date"]',
    'supplier.approved'
),
(
    'review_confirmation',
    'Thank You for Your Review',
    '<h1>Thank You!</h1><p>Your review for {{safari_name}} has been submitted.</p>',
    'Thank You!\n\nYour review for {{safari_name}} has been submitted.',
    '["customer_name", "safari_name", "rating"]',
    'review.submitted'
)
ON CONFLICT (name) DO NOTHING;

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template info
    name VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Template variables
    variables JSONB DEFAULT '[]',
    
    -- Channels
    channels VARCHAR(32)[] DEFAULT ARRAY['in_app'], -- 'in_app', 'push', 'email'
    
    -- For use with events
    default_for_event automation_event_type,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default notification templates
INSERT INTO notification_templates (name, title, message, variables, channels, default_for_event) VALUES
(
    'new_booking_admin',
    'New Booking',
    'New booking {{booking_id}} from {{customer_name}} for {{safari_name}}',
    '["booking_id", "customer_name", "safari_name", "amount"]',
    ARRAY['in_app', 'email'],
    'booking.created'
),
(
    'payment_received_admin',
    'Payment Received',
    'Payment of {{amount}} {{currency}} received for booking {{booking_id}}',
    '["booking_id", "amount", "currency", "payment_method"]',
    ARRAY['in_app'],
    'payment.completed'
),
(
    'supplier_approved_admin',
    'Supplier Approved',
    'Supplier {{supplier_name}} has been approved',
    '["supplier_name", "category"]',
    ARRAY['in_app', 'email'],
    'supplier.approved'
),
(
    'review_submitted_supplier',
    'New Review',
    'You received a {{rating}}-star review: {{review_excerpt}}',
    '["supplier_name", "rating", "review_excerpt"]',
    ARRAY['in_app', 'email'],
    'review.submitted'
)
ON CONFLICT (name) DO NOTHING;

-- Insert default workflows
INSERT INTO workflows (name, description, trigger_event, actions, priority) VALUES
(
    'Booking Confirmation Email',
    'Send confirmation email when a booking is created',
    'booking.created',
    '[
        {"type": "send_email", "template": "booking_confirmation"},
        {"type": "send_notification", "template": "new_booking_admin"}
    ]'::jsonb,
    10
),
(
    'Payment Confirmation',
    'Send payment receipt and update booking status',
    'payment.completed',
    '[
        {"type": "send_email", "template": "payment_receipt"},
        {"type": "update_status", "status": "confirmed"},
        {"type": "generate_document", "document_type": "invoice"}
    ]'::jsonb,
    20
),
(
    'Supplier Approval Notification',
    'Notify supplier when approved and generate welcome document',
    'supplier.approved',
    '[
        {"type": "send_email", "template": "supplier_approval"},
        {"type": "notify_supplier", "message": "Your supplier application has been approved!"},
        {"type": "generate_document", "document_type": "supplier_contract"}
    ]'::jsonb,
    15
),
(
    'Review Submitted',
    'Thank customer for review and notify supplier',
    'review.submitted',
    '[
        {"type": "send_email", "template": "review_confirmation"},
        {"type": "notify_supplier", "template": "review_submitted_supplier"}
    ]'::jsonb,
    25
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF AUTOMATION ENGINE
-- =============================================================================

-- =============================================================================
-- ANALYTICS TRACKING
-- Event-based analytics and tracking
-- =============================================================================

-- Page views and sessions
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session info
    session_id VARCHAR(128),
    user_id VARCHAR(64),
    
    -- Page info
    page_type VARCHAR(64) NOT NULL, -- 'home', 'destination', 'package', 'booking', 'cms'
    page_id VARCHAR(128),
    url VARCHAR(512),
    
    -- Referrer
    referrer VARCHAR(512),
    referrer_type VARCHAR(32), -- 'internal', 'external', 'direct'
    
    -- Device info
    device_type VARCHAR(32), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(64),
    os VARCHAR(64),
    
    -- Location
    country VARCHAR(64),
    city VARCHAR(128),
    
    -- Timing
    view_duration_seconds INT DEFAULT 0,
    scroll_depth NUMERIC(5, 2), -- Percentage
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_type ON page_views(page_type);
CREATE INDEX idx_page_views_created ON page_views(created_at DESC);

-- Search analytics
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Search info
    session_id VARCHAR(128),
    user_id VARCHAR(64),
    
    -- Query
    query_text TEXT,
    filters JSONB DEFAULT '{}',
    results_count INT DEFAULT 0,
    clicked_result_index INT,
    clicked_result_id VARCHAR(128),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_session ON search_analytics(session_id);
CREATE INDEX idx_search_user ON search_analytics(user_id);
CREATE INDEX idx_search_created ON search_analytics(created_at DESC);

-- Booking funnel tracking
CREATE TABLE IF NOT EXISTS booking_funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Funnel step
    session_id VARCHAR(128) NOT NULL,
    user_id VARCHAR(64),
    
    -- Funnel info
    step VARCHAR(64) NOT NULL, -- 'view', 'save', 'itinerary', 'select_package', 'checkout', 'payment', 'confirmation'
    
    -- Context
    destination_id VARCHAR(128),
    package_id VARCHAR(128),
    booking_id VARCHAR(128),
    
    -- Timing
    time_on_step_seconds INT DEFAULT 0,
    
    -- Result
    completed BOOLEAN DEFAULT FALSE,
    abandoned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_funnel_session ON booking_funnel(session_id);
CREATE INDEX idx_funnel_step ON booking_funnel(step);
CREATE INDEX idx_funnel_created ON booking_funnel(created_at DESC);

-- Conversion tracking
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Conversion type
    conversion_type VARCHAR(64) NOT NULL, -- 'registration', 'booking', 'package_save', 'newsletter'
    
    -- Attribution
    session_id VARCHAR(128),
    user_id VARCHAR(64),
    
    -- Source
    source VARCHAR(64), -- 'organic', 'paid', 'referral', 'email', 'social'
    medium VARCHAR(64),
    campaign VARCHAR(128),
    
    -- Value
    value NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Context
    booking_id VARCHAR(128),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversions_type ON conversions(conversion_type);
CREATE INDEX idx_conversions_user ON conversions(user_id);
CREATE INDEX idx_conversions_source ON conversions(source);
CREATE INDEX idx_conversions_created ON conversions(created_at DESC);

-- Event subscribers (which workflows to trigger for each event)
CREATE TABLE IF NOT EXISTS event_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event configuration
    event_type automation_event_type NOT NULL,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    
    -- Conditions (JSONB for advanced filtering)
    conditions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Priority (lower = higher priority)
    priority INT DEFAULT 100,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_type, workflow_id)
);

CREATE INDEX idx_subscribers_event ON event_subscribers(event_type);
CREATE INDEX idx_subscribers_workflow ON event_subscribers(workflow_id);
CREATE INDEX idx_subscribers_active ON event_subscribers(is_active) WHERE is_active = TRUE;

-- Insert default event subscribers
INSERT INTO event_subscribers (event_type, workflow_id, priority) 
SELECT 'booking.created', id, 10 FROM workflows WHERE name = 'Booking Confirmation Email'
ON CONFLICT DO NOTHING;

INSERT INTO event_subscribers (event_type, workflow_id, priority)
SELECT 'payment.completed', id, 20 FROM workflows WHERE name = 'Payment Confirmation'
ON CONFLICT DO NOTHING;

INSERT INTO event_subscribers (event_type, workflow_id, priority)
SELECT 'supplier.approved', id, 15 FROM workflows WHERE name = 'Supplier Approval Notification'
ON CONFLICT DO NOTHING;

INSERT INTO event_subscribers (event_type, workflow_id, priority)
SELECT 'review.submitted', id, 25 FROM workflows WHERE name = 'Review Submitted'
ON CONFLICT DO NOTHING;

-- Workflow event triggers (link workflows to specific events they should listen to)
CREATE TABLE IF NOT EXISTS workflow_event_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    event_type automation_event_type NOT NULL,
    
    -- Filter conditions
    conditions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workflow_id, event_type)
);

-- Insert workflow event triggers for existing workflows
INSERT INTO workflow_event_triggers (workflow_id, event_type)
SELECT id, 'booking.created' FROM workflows WHERE name = 'Booking Confirmation Email'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_event_triggers (workflow_id, event_type)
SELECT id, 'payment.completed' FROM workflows WHERE name = 'Payment Confirmation'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_event_triggers (workflow_id, event_type)
SELECT id, 'supplier.approved' FROM workflows WHERE name = 'Supplier Approval Notification'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_event_triggers (workflow_id, event_type)
SELECT id, 'review.submitted' FROM workflows WHERE name = 'Review Submitted'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF ANALYTICS TRACKING
-- =============================================================================

-- =============================================================================
-- WORKFLOW TEMPLATES
-- Pre-configured workflow templates for common scenarios
-- =============================================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template info
    name VARCHAR(128) NOT NULL,
    description TEXT,
    category VARCHAR(64), -- 'onboarding', 'marketing', 'operations', 'notifications'
    
    -- Configuration
    trigger_event automation_event_type NOT NULL,
    actions JSONB NOT NULL,
    conditions JSONB DEFAULT '{}',
    
    -- Settings
    priority INT DEFAULT 100,
    max_retries INT DEFAULT 3,
    timeout_seconds INT DEFAULT 300,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE, -- System templates cannot be deleted
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert workflow templates
INSERT INTO workflow_templates (name, description, category, trigger_event, actions, is_system) VALUES
(
    'Welcome New User',
    'Welcome email and onboarding sequence for new users',
    'onboarding',
    'user.registered',
    '[
        {"type": "send_email", "template": "welcome"},
        {"type": "send_notification", "message": "Welcome to IDENT AFRICA!"},
        {"type": "loyalty_award", "points": 100, "reason": "signup_bonus"}
    ]'::jsonb,
    TRUE
),
(
    'Destination Popularity Alert',
    'Notify admin when destination gets popular',
    'marketing',
    'destination.viewed',
    '[
        {"type": "update_analytics", "metric": "destination_views"},
        {"type": "send_notification", "template": "destination_trending"}
    ]'::jsonb,
    TRUE
),
(
    'Package Saved Follow-up',
    'Follow up with users who saved a package',
    'marketing',
    'package.saved',
    '[
        {"type": "send_notification", "message": "Remember to book your safari!"},
        {"type": "update_analytics", "metric": "package_save_rate"}
    ]'::jsonb,
    TRUE
),
(
    'Booking Abandonment Reminder',
    'Remind users who abandoned checkout',
    'marketing',
    'analytics.checkout_started',
    '[
        {"type": "send_email", "template": "booking_abandoned"},
        {"type": "update_analytics", "metric": "abandonment_rate"}
    ]'::jsonb,
    TRUE
),
(
    'Post-Booking Survey',
    'Send survey after booking completion',
    'operations',
    'booking.completed',
    '[
        {"type": "send_email", "template": "post_booking_survey"},
        {"type": "loyalty_award", "points": 50, "reason": "booking_completed"}
    ]'::jsonb,
    TRUE
),
(
    'Payment Failure Recovery',
    'Handle payment failures gracefully',
    'operations',
    'payment.failed',
    '[
        {"type": "send_email", "template": "payment_failed"},
        {"type": "send_notification", "message": "Payment failed - please retry"}
    ]'::jsonb,
    TRUE
),
(
    'Content Update Notification',
    'Notify relevant users of content updates',
    'notifications',
    'content.updated',
    '[
        {"type": "send_notification", "template": "content_updated"},
        {"type": "update_analytics", "metric": "content_update_views"}
    ]'::jsonb,
    TRUE
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF WORKFLOW TEMPLATES
-- =============================================================================

-- =============================================================================
-- MONETIZATION SYSTEM
-- Supplier commissions, subscriptions, and promotions
-- =============================================================================

-- Commission types
CREATE TYPE commission_type AS ENUM (
    'global',
    'supplier_specific',
    'package_specific'
);

-- Commission rules
CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule info
    name VARCHAR(128) NOT NULL,
    description TEXT,
    
    -- Commission type and scope
    commission_type commission_type NOT NULL,
    
    -- For supplier-specific
    supplier_id VARCHAR(64),
    
    -- For package-specific
    package_id VARCHAR(128),
    
    -- Commission settings
    commission_percentage NUMERIC(5, 2) NOT NULL, -- e.g., 15.00 for 15%
    minimum_commission NUMERIC(12, 2) DEFAULT 0, -- Minimum commission amount
    maximum_commission NUMERIC(12, 2), -- Maximum commission amount (NULL = no limit)
    
    -- Category-based overrides
    category VARCHAR(64), -- Apply to specific category
    destination_id VARCHAR(128), -- Apply to specific destination
    
    -- Date range
    start_date DATE,
    end_date DATE,
    
    -- Priority (higher = takes precedence)
    priority INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commission_rules_type ON commission_rules(commission_type);
CREATE INDEX idx_commission_rules_supplier ON commission_rules(supplier_id);
CREATE INDEX idx_commission_rules_package ON commission_rules(package_id);
CREATE INDEX idx_commission_rules_active ON commission_rules(is_active) WHERE is_active = TRUE;

-- Insert default global commission rule
INSERT INTO commission_rules (name, description, commission_type, commission_percentage, priority) VALUES
('Default Global Commission', 'Standard commission applied to all bookings', 'global', 15.00, 0)
ON CONFLICT DO NOTHING;

-- Supplier plans (subscription tiers)
CREATE TYPE subscription_status AS ENUM (
    'active',
    'trial',
    'expired',
    'cancelled',
    'pending'
);

CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'quarterly',
    'annual'
);

CREATE TABLE IF NOT EXISTS supplier_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan info
    plan_name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    
    -- Pricing
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_quarterly NUMERIC(10, 2),
    price_annual NUMERIC(10, 2),
    
    -- Features (JSON array of feature names)
    features JSONB DEFAULT '[]',
    
    -- Limits
    max_packages INT DEFAULT 10,
    max_images_per_package INT DEFAULT 10,
    featured_listings_included INT DEFAULT 0,
    priority_support BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    
    -- Commission discount for this plan (percentage)
    commission_discount NUMERIC(5, 2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE, -- Show in pricing page
    
    -- Order for display
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO supplier_plans (plan_name, description, price_monthly, price_quarterly, price_annual, features, max_packages, display_order) VALUES
(
    'Free',
    'Get started with basic listing features',
    0.00, 0.00, 0.00,
    '["basic_listing", "inquiry_only", "basic_analytics"]'::jsonb,
    3,
    1
),
(
    'Professional',
    'Perfect for growing safari businesses',
    49.00, 129.00, 449.00,
    '["full_listing", "online_bookings", "advanced_analytics", "email_support", "5_featured"]'::jsonb,
    25,
    2
),
(
    'Premium Partner',
    'For established operators seeking growth',
    149.00, 399.00, 1399.00,
    '["full_listing", "online_bookings", "advanced_analytics", "priority_support", "api_access", "custom_branding", "unlimited_featured", "dedicated_manager"]'::jsonb,
    -1, -- Unlimited
    3
)
ON CONFLICT (plan_name) DO NOTHING;

-- Supplier subscriptions
CREATE TABLE IF NOT EXISTS supplier_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier reference
    supplier_id VARCHAR(64) NOT NULL,
    
    -- Plan info
    plan_id UUID REFERENCES supplier_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(64), -- Snapshot for historical reference
    
    -- Subscription details
    status subscription_status DEFAULT 'pending',
    
    -- Billing
    billing_cycle billing_cycle DEFAULT 'monthly',
    price_amount NUMERIC(10, 2) NOT NULL, -- Amount charged
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Trial
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    is_trial_used BOOLEAN DEFAULT FALSE,
    
    -- Dates
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment tracking
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    failed_payment_attempts INT DEFAULT 0,
    
    -- Features snapshot
    features_snapshot JSONB DEFAULT '[]',
    limits_snapshot JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_supplier ON supplier_subscriptions(supplier_id);
CREATE INDEX idx_subscriptions_status ON supplier_subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON supplier_subscriptions(expires_at);
CREATE UNIQUE INDEX idx_subscriptions_active_supplier ON supplier_subscriptions(supplier_id) WHERE status IN ('active', 'trial', 'pending');

-- Subscription payments
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Subscription reference
    subscription_id UUID REFERENCES supplier_subscriptions(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL,
    
    -- Payment info
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Billing period
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Payment method
    payment_method VARCHAR(32),
    payment_reference VARCHAR(128),
    
    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sub_payments_subscription ON subscription_payments(subscription_id);
CREATE INDEX idx_sub_payments_supplier ON subscription_payments(supplier_id);
CREATE INDEX idx_sub_payments_status ON subscription_payments(status);

-- Promoted/Featured listings
CREATE TYPE promotion_placement AS ENUM (
    'homepage_hero',
    'homepage_featured',
    'search_top',
    'category_featured',
    'destination_featured',
    'newsletter_featured'
);

CREATE TYPE promotion_payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

CREATE TABLE IF NOT EXISTS promoted_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supplier and package
    supplier_id VARCHAR(64) NOT NULL,
    package_id VARCHAR(128), -- NULL for supplier-wide promotion
    
    -- Placement
    placement promotion_placement NOT NULL,
    
    -- Date range
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Pricing
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment
    payment_status promotion_payment_status DEFAULT 'pending',
    payment_id UUID,
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    impressions_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    
    -- Admin approval
    approved_by VARCHAR(64),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promoted_supplier ON promoted_listings(supplier_id);
CREATE INDEX idx_promoted_package ON promoted_listings(package_id);
CREATE INDEX idx_promoted_placement ON promoted_listings(placement);
CREATE INDEX idx_promoted_dates ON promoted_listings(start_date, end_date);
CREATE INDEX idx_promoted_active ON promoted_listings(is_active, start_date, end_date) WHERE is_active = TRUE;

-- Promoted listing pricing (template)
CREATE TABLE IF NOT EXISTS promotion_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Placement
    placement promotion_placement NOT NULL UNIQUE,
    
    -- Pricing
    price_daily NUMERIC(10, 2), -- Daily rate
    price_weekly NUMERIC(10, 2), -- Weekly rate
    price_monthly NUMERIC(10, 2), -- Monthly rate
    
    -- Settings
    is_available BOOLEAN DEFAULT TRUE,
    max_duration_days INT DEFAULT 30,
    min_duration_days INT DEFAULT 1,
    
    -- Priority (for overlapping placements)
    priority INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default promotion pricing
INSERT INTO promotion_pricing (placement, price_daily, price_weekly, price_monthly, priority) VALUES
('homepage_hero', 99.00, 599.00, 1999.00, 100),
('homepage_featured', 49.00, 299.00, 999.00, 80),
('search_top', 29.00, 169.00, 549.00, 60),
('category_featured', 19.00, 99.00, 299.00, 40),
('destination_featured', 19.00, 99.00, 299.00, 40),
('newsletter_featured', 15.00, 75.00, 249.00, 20)
ON CONFLICT (placement) DO NOTHING;

-- Revenue tracking
CREATE TYPE revenue_type AS ENUM (
    'commission',
    'subscription',
    'promotion',
    'other'
);

CREATE TABLE IF NOT EXISTS revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Revenue type
    revenue_type revenue_type NOT NULL,
    
    -- Amount
    gross_amount NUMERIC(12, 2) NOT NULL,
    net_amount NUMERIC(12, 2) NOT NULL, -- After any fees/refunds
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Source reference
    booking_id VARCHAR(128), -- For commission revenue
    supplier_id VARCHAR(64), -- For subscription/promotion
    subscription_id UUID, -- For subscription revenue
    promotion_id UUID, -- For promotion revenue
    
    -- Period (for reporting)
    revenue_date DATE NOT NULL,
    revenue_month INT, -- YYYYMM format
    revenue_year INT,
    
    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revenue_type ON revenue(revenue_type);
CREATE INDEX idx_revenue_date ON revenue(revenue_date);
CREATE INDEX idx_revenue_month ON revenue(revenue_month);
CREATE INDEX idx_revenue_supplier ON revenue(supplier_id);
CREATE INDEX idx_revenue_booking ON revenue(booking_id);

-- Revenue summary (materialized for fast reporting)
CREATE TABLE IF NOT EXISTS revenue_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Period
    period_type VARCHAR(16) NOT NULL, -- 'daily', 'monthly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Revenue by type
    commission_revenue NUMERIC(12, 2) DEFAULT 0,
    subscription_revenue NUMERIC(12, 2) DEFAULT 0,
    promotion_revenue NUMERIC(12, 2) DEFAULT 0,
    other_revenue NUMERIC(12, 2) DEFAULT 0,
    
    -- Total
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    
    -- Counts
    total_bookings INT DEFAULT 0,
    total_subscriptions INT DEFAULT 0,
    total_promotions INT DEFAULT 0,
    
    -- Currency
    currency VARCHAR(3) DEFAULT 'USD',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(period_type, period_start, currency)
);

-- =============================================================================
-- END OF MONETIZATION SYSTEM
-- =============================================================================
-- =============================================================================
-- SECURITY AND PERMISSIONS SYSTEM
-- Role-based access control and audit logging
-- =============================================================================

-- User roles enumeration
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin',
    'content_manager',
    'finance_manager',
    'supplier',
    'customer'
);

-- Role permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL UNIQUE,
    role_name VARCHAR(64) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default role permissions
INSERT INTO role_permissions (role, role_name, description, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access', '{"modules": ["all"], "actions": {"all": ["read", "create", "update", "delete", "approve", "export"]}, "constraints": {"own_only": false}}'::jsonb, TRUE),
('admin', 'Administrator', 'Administrative access', '{"modules": ["destinations", "packages", "bookings", "payments", "suppliers", "users", "reports", "analytics"], "actions": {"destinations": ["read", "create", "update", "delete"], "packages": ["read", "create", "update", "delete"], "bookings": ["read", "create", "update", "delete"], "payments": ["read", "create", "update"], "suppliers": ["read", "create", "update"], "users": ["read", "create", "update"], "reports": ["read", "export"], "analytics": ["read", "export"]}, "constraints": {"own_only": false}}'::jsonb, TRUE),
('content_manager', 'Content Manager', 'CMS only', '{"modules": ["destinations", "packages", "experiences", "media", "cms"], "actions": {"destinations": ["read", "create", "update", "delete"], "packages": ["read", "create", "update", "delete"], "experiences": ["read", "create", "update", "delete"], "media": ["read", "create", "update", "delete"], "cms": ["read", "create", "update", "delete"]}, "constraints": {"own_only": false}}'::jsonb, TRUE),
('finance_manager', 'Finance Manager', 'Financial data only', '{"modules": ["payments", "commissions", "payouts", "revenue", "reports"], "actions": {"payments": ["read", "create", "refund"], "commissions": ["read", "export"], "payouts": ["read", "create", "update"], "revenue": ["read", "export"], "reports": ["read", "export"]}, "constraints": {"own_only": false}}'::jsonb, TRUE),
('supplier', 'Supplier', 'Own business only', '{"modules": ["suppliers", "packages", "bookings", "payments", "reviews", "analytics"], "actions": {"suppliers": ["read", "update"], "packages": ["read", "create", "update", "delete"], "bookings": ["read"], "payments": ["read"], "reviews": ["read"], "analytics": ["read"]}, "constraints": {"own_only": true, "own_entity_field": "supplier_id"}}'::jsonb, TRUE),
('customer', 'Customer', 'Own profile only', '{"modules": ["profile", "bookings", "payments", "reviews", "loyalty"], "actions": {"profile": ["read", "update"], "bookings": ["read", "create"], "payments": ["read"], "reviews": ["read", "create"], "loyalty": ["read"]}, "constraints": {"own_only": true, "own_entity_field": "user_id"}}'::jsonb, TRUE)
ON CONFLICT (role) DO NOTHING;

-- API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    key_hash VARCHAR(256) NOT NULL,
    key_prefix VARCHAR(8) NOT NULL,
    user_id VARCHAR(64),
    service_name VARCHAR(64),
    scopes JSONB DEFAULT '[]',
    rate_limit INT DEFAULT 1000,
    rate_limit_period VARCHAR(16) DEFAULT 'hour',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    total_requests INT DEFAULT 0,
    allowed_ips JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

-- Audit log
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'password_change', 'permission_change', 'api_key_created', 'api_key_revoked', 'payment_processed', 'payment_refunded', 'data_export', 'access_denied');

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64),
    user_role user_role,
    session_id VARCHAR(128),
    ip_address INET,
    action audit_action NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    details JSONB DEFAULT '{}',
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Row-level security policies
CREATE TABLE IF NOT EXISTS row_security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    table_name VARCHAR(64) NOT NULL,
    select_policy JSONB,
    insert_policy JSONB,
    update_policy JSONB,
    delete_policy JSONB,
    applicable_roles user_role[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO row_security_policies (name, description, table_name, select_policy, applicable_roles) VALUES
('suppliers_own_data', 'Suppliers see own data', 'suppliers', '{"field": "id", "condition": "equals", "user_field": "supplier_id"}', ARRAY['supplier'::user_role]),
('bookings_supplier_filter', 'Suppliers see their bookings', 'bookings', '{"field": "supplier_id", "condition": "equals", "user_field": "supplier_id"}', ARRAY['supplier'::user_role]),
('bookings_customer_filter', 'Customers see own bookings', 'bookings', '{"field": "user_id", "condition": "equals", "user_field": "user_id"}', ARRAY['customer'::user_role]),
('packages_supplier_filter', 'Suppliers see own packages', 'packages', '{"field": "supplier_id", "condition": "equals", "user_field": "supplier_id"}', ARRAY['supplier'::user_role])
ON CONFLICT (name) DO NOTHING;

-- Login attempts
CREATE TYPE login_status AS ENUM ('success', 'failed', 'locked', 'blocked_ip');

CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64),
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    status login_status NOT NULL,
    failure_reason VARCHAR(128),
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_user ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(256) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(32),
    country VARCHAR(64),
    city VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_current BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR(256),
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_active ON user_sessions(is_active) WHERE is_active = TRUE;

-- Password history
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_history_user ON password_history(user_id);

-- =============================================================================
-- END OF SECURITY AND PERMISSIONS SYSTEM
-- =============================================================================

-- =============================================================================
-- PAYMENT SECURITY SYSTEM
-- =============================================================================

-- Payment idempotency
CREATE TABLE IF NOT EXISTS payment_idempotency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    request_hash VARCHAR(256) NOT NULL,
    response_status INT,
    response_body JSONB,
    response_created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_idempotency_key ON payment_idempotency(idempotency_key);
CREATE INDEX idx_idempotency_expires ON payment_idempotency(expires_at) WHERE expires_at > CURRENT_TIMESTAMP;

-- Transaction log
CREATE TABLE IF NOT EXISTS transaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(128) NOT NULL,
    payment_id VARCHAR(128),
    booking_id VARCHAR(128),
    provider VARCHAR(32) NOT NULL,
    provider_transaction_id VARCHAR(256),
    transaction_type VARCHAR(32) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(32) NOT NULL,
    signature VARCHAR(512),
    webhook_verified BOOLEAN DEFAULT FALSE,
    request_payload JSONB,
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_code VARCHAR(64),
    error_message TEXT
);

CREATE INDEX idx_tx_log_payment ON transaction_logs(payment_id);
CREATE INDEX idx_tx_log_booking ON transaction_logs(booking_id);
CREATE INDEX idx_tx_log_provider ON transaction_logs(provider, provider_transaction_id);

-- Refund tracking
CREATE TABLE IF NOT EXISTS refund_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id VARCHAR(128) NOT NULL UNIQUE,
    original_payment_id VARCHAR(128) NOT NULL,
    booking_id VARCHAR(128),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reason VARCHAR(255),
    refund_type VARCHAR(32),
    status VARCHAR(32) DEFAULT 'pending',
    requested_by VARCHAR(64),
    approved_by VARCHAR(64),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    provider VARCHAR(32),
    provider_refund_id VARCHAR(256),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refund_payment ON refund_tracking(original_payment_id);
CREATE INDEX idx_refund_status ON refund_tracking(status);

-- Webhook logs
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(32) NOT NULL,
    event_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    request_ip INET,
    request_headers JSONB,
    request_body JSONB,
    signature_valid BOOLEAN DEFAULT FALSE,
    signature_used VARCHAR(512),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_result VARCHAR(32),
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_provider ON webhook_logs(provider, event_id);
CREATE INDEX idx_webhook_processed ON webhook_logs(processed, created_at DESC);

-- =============================================================================
-- END OF PAYMENT SECURITY SYSTEM
-- =============================================================================
-- =============================================================================
-- CONTENT MIGRATION SYSTEM
-- Content status, ownership, and migration tools
-- =============================================================================

-- Content ownership types
CREATE TYPE content_ownership AS ENUM (
    'system',    -- Default content created by system
    'admin',     -- Content created by admin users
    'supplier'   -- Content created by suppliers
);

-- Content status
CREATE TYPE content_status AS ENUM (
    'default',   -- Pre-loaded default content
    'draft',     -- Under review/not published
    'published', -- Live and visible
    'archived'  -- Hidden but retained
);

-- Add columns to existing tables for content status and ownership
-- These will be added via ALTER TABLE in migration

-- Content migration history
CREATE TABLE IF NOT EXISTS content_migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Migration info
    migration_type VARCHAR(64) NOT NULL, -- 'import', 'bulk_edit', 'publish', 'unpublish', 'replace_images', 'ownership_change'
    description TEXT,
    
    -- Scope
    content_type VARCHAR(64) NOT NULL, -- 'destinations', 'packages', 'experiences', 'media'
    affected_ids JSONB DEFAULT '[]', -- Array of affected content IDs
    
    -- Performed by
    performed_by VARCHAR(64), -- User ID or 'system'
    performed_role user_role,
    
    -- Statistics
    items_processed INT DEFAULT 0,
    items_succeeded INT DEFAULT 0,
    items_failed INT DEFAULT 0,
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    error_message TEXT,
    
    -- Configuration
    config JSONB DEFAULT '{}', -- Migration-specific configuration
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_migrations_type ON content_migrations(migration_type);
CREATE INDEX idx_migrations_status ON content_migrations(status);
CREATE INDEX idx_migrations_performed ON content_migrations(performed_by);
CREATE INDEX idx_migrations_created ON content_migrations(created_at DESC);

-- Content version history (for tracking changes)
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content reference
    content_type VARCHAR(64) NOT NULL, -- 'destinations', 'packages', 'experiences'
    content_id VARCHAR(128) NOT NULL,
    
    -- Version info
    version_number INT NOT NULL,
    
    -- Who and what
    modified_by VARCHAR(64),
    modification_type VARCHAR(32) NOT NULL, -- 'create', 'update', 'publish', 'unpublish', 'archive'
    
    -- Snapshot
    content_snapshot JSONB NOT NULL, -- Full content at this version
    
    -- Change details
    changes_summary TEXT, -- Human-readable summary of changes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_type, content_id, version_number)
);

CREATE INDEX idx_versions_content ON content_versions(content_type, content_id);
CREATE INDEX idx_versions_created ON content_versions(created_at DESC);

-- Content replacement mapping (for image/content replacement)
CREATE TABLE IF NOT EXISTS content_replacement_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Replacement info
    content_type VARCHAR(64) NOT NULL,
    content_id VARCHAR(128) NOT NULL,
    
    -- What to replace
    field_name VARCHAR(64) NOT NULL, -- 'image_url', 'gallery', etc.
    old_value TEXT NOT NULL,
    old_value_hash VARCHAR(64) NOT NULL, -- For quick lookup
    
    -- Replacement
    new_value TEXT NOT NULL,
    new_value_hash VARCHAR(64),
    
    -- Status
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_by VARCHAR(64),
    
    -- Migration reference
    migration_id UUID REFERENCES content_migrations(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_replacement_content ON content_replacement_map(content_type, content_id);
CREATE INDEX idx_replacement_old_hash ON content_replacement_map(old_value_hash);
CREATE INDEX idx_replacement_applied ON content_replacement_map(is_applied) WHERE is_applied = FALSE;

-- Bulk content operations log
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Operation info
    operation_type VARCHAR(64) NOT NULL, -- 'bulk_publish', 'bulk_unpublish', 'bulk_archive', 'bulk_delete', 'bulk_status_change'
    
    -- Filters (what was selected)
    filters JSONB DEFAULT '{}', -- Criteria used to select content
    
    -- Selection
    selected_ids JSONB NOT NULL, -- IDs selected for operation
    total_selected INT NOT NULL,
    
    -- Results
    results JSONB DEFAULT '{}', -- Success/failure per item
    
    -- Performed by
    performed_by VARCHAR(64),
    performed_role user_role,
    
    -- Status
    status VARCHAR(32) DEFAULT 'pending',
    processed_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bulk_ops_type ON bulk_operations(operation_type);
CREATE INDEX idx_bulk_ops_status ON bulk_operations(status);
CREATE INDEX idx_bulk_ops_performed ON bulk_operations(performed_by);

-- Content ownership transfer log
CREATE TABLE IF NOT EXISTS ownership_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content info
    content_type VARCHAR(64) NOT NULL,
    content_id VARCHAR(128) NOT NULL,
    
    -- Transfer details
    previous_owner_type content_ownership,
    previous_owner_id VARCHAR(64),
    new_owner_type content_ownership NOT NULL,
    new_owner_id VARCHAR(64) NOT NULL,
    
    -- Reason
    transfer_reason TEXT,
    
    -- Migration reference
    migration_id UUID REFERENCES content_migrations(id) ON DELETE SET NULL,
    
    -- Performed by
    performed_by VARCHAR(64) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfers_content ON ownership_transfers(content_type, content_id);
CREATE INDEX idx_transfers_new_owner ON ownership_transfers(new_owner_id);
CREATE INDEX idx_transfers_created ON ownership_transfers(created_at DESC);

-- Default content registry (tracks what's pre-loaded)
CREATE TABLE IF NOT EXISTS default_content_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content info
    content_type VARCHAR(64) NOT NULL,
    content_id VARCHAR(128) NOT NULL UNIQUE,
    
    -- Original data (for reference/replacement)
    original_data JSONB NOT NULL,
    
    -- Replacement tracking
    replacement_mappings JSONB DEFAULT '[]', -- Array of replacement URLs
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    can_be_modified BOOLEAN DEFAULT FALSE, -- Some default content should not be modified
    show_in_migration BOOLEAN DEFAULT TRUE, -- Show in admin migration tools
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registry_type ON default_content_registry(content_type);
CREATE INDEX idx_registry_active ON default_content_registry(is_active) WHERE is_active = TRUE;

-- Insert existing destinations as default content
INSERT INTO default_content_registry (content_type, content_id, original_data, is_active, can_be_modified, show_in_migration)
SELECT 'destinations', id::text, row_to_json(d)::jsonb, TRUE, FALSE, TRUE
FROM destinations d
WHERE name IN ('Serengeti', 'Masai Mara', 'Kruger National Park', 'Ngorongoro Crater', 'Mount Kilimanjaro')
ON CONFLICT (content_id) DO NOTHING;

-- =============================================================================
-- END OF CONTENT MIGRATION SYSTEM
-- =============================================================================

-- =============================================================================
-- SCHEMA MIGRATIONS (Run these separately)
-- =============================================================================

-- Add content_status and ownership to destinations
-- ALTER TABLE destinations ADD COLUMN IF NOT EXISTS content_status content_status DEFAULT 'published';
-- ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ownership_type content_ownership DEFAULT 'system';
-- ALTER TABLE destinations ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
-- ALTER TABLE destinations ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR(64);

-- Add content_status and ownership to packages
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS content_status content_status DEFAULT 'published';
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS ownership_type content_ownership DEFAULT 'system';
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
-- ALTER TABLE packages ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR(64);

-- Add content_status and ownership to experiences
-- ALTER TABLE experiences ADD COLUMN IF NOT EXISTS content_status content_status DEFAULT 'published';
-- ALTER TABLE experiences ADD COLUMN IF NOT EXISTS ownership_type content_ownership DEFAULT 'system';
-- ALTER TABLE experiences ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
-- ALTER TABLE experiences ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR(64);

-- Add indexes for content status filtering
-- CREATE INDEX idx_destinations_status ON destinations(content_status);
-- CREATE INDEX idx_packages_status ON packages(content_status);
-- CREATE INDEX idx_experiences_status ON experiences(content_status);
