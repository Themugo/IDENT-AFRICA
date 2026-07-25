-- =============================================================================
-- SUPPLIER ECOSYSTEM - Database Schema
-- =============================================================================

-- =============================================================================
-- 41. SUPPLIERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Company Information
    company_name VARCHAR(255) NOT NULL,
    supplier_type VARCHAR(50) NOT NULL CHECK (supplier_type IN (
        'lodge', 'hotel', 'safari_operator', 'tour_guide', 
        'transport_company', 'activity_provider', 'restaurant', 'car_rental'
    )),
    description TEXT,
    tagline VARCHAR(255),
    
    -- Branding
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    
    -- Location
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Kenya',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    social_media JSONB DEFAULT '{}',
    
    -- Business Details
    business_registration_number VARCHAR(100),
    tax_identification_number VARCHAR(100),
    
    -- Documents
    business_license_url TEXT,
    insurance_certificate_url TEXT,
    permits_url TEXT[],
    
    -- Verification
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'documents_submitted', 'under_review', 'verified', 'rejected'
    )),
    verification_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'suspended', 'inactive'
    )),
    
    -- Commission & Payment
    commission_rate DECIMAL(5, 2) DEFAULT 15.00,
    payment_terms VARCHAR(50) DEFAULT 'net_30',
    bank_name VARCHAR(100),
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_swift_code VARCHAR(20),
    
    -- Statistics
    total_products INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Metadata
    featured BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);

-- =============================================================================
-- 42. SUPPLIER DOCUMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS supplier_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'business_license', 'tax_certificate', 'insurance', 'permit', 
        'membership', 'award', 'other'
    )),
    document_name VARCHAR(255),
    document_url TEXT NOT NULL,
    document_number VARCHAR(100),
    issued_date DATE,
    expiry_date DATE,
    
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'rejected', 'expired'
    )),
    verification_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_docs_supplier ON supplier_documents(supplier_id);

-- =============================================================================
-- 43. SUPPLIER PRODUCTS (Packages owned by suppliers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN (
        'package', 'accommodation', 'experience', 'transport', 'meal_plan'
    )),
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    short_description VARCHAR(500),
    description TEXT,
    
    -- Media
    cover_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    -- Location
    location_name VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Pricing
    base_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    price_includes TEXT[],
    price_excludes TEXT[],
    
    -- Duration
    duration_days INTEGER DEFAULT 1,
    duration_nights INTEGER DEFAULT 0,
    
    -- Capacity
    min_guests INTEGER DEFAULT 1,
    max_guests INTEGER DEFAULT 10,
    
    -- Availability
    availability_type VARCHAR(20) DEFAULT 'on_request' CHECK (availability_type IN (
        'always', 'on_request', 'limited', 'blocked'
    )),
    instant_booking BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_review', 'approved', 'rejected', 'archived'
    )),
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Statistics
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_type ON supplier_products(product_type);
CREATE INDEX IF NOT EXISTS idx_supplier_products_status ON supplier_products(status);

-- =============================================================================
-- 44. PRODUCT AVAILABILITY
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    available_units INTEGER DEFAULT 1,
    booked_units INTEGER DEFAULT 0,
    price_modifier DECIMAL(5, 2) DEFAULT 100,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN (
        'available', 'limited', 'sold_out', 'blocked'
    )),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_product ON product_availability(product_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON product_availability(date);

-- =============================================================================
-- 45. REVIEWS & RATINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What is being reviewed
    reviewable_type VARCHAR(50) NOT NULL CHECK (reviewable_type IN (
        'supplier', 'product', 'guide', 'accommodation'
    )),
    reviewable_id UUID NOT NULL,
    
    -- Who is reviewing
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    
    -- Rating
    overall_rating DECIMAL(2, 1) NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    service_rating DECIMAL(2, 1) CHECK (service_rating BETWEEN 1 AND 5),
    value_rating DECIMAL(2, 1) CHECK (value_rating BETWEEN 1 AND 5),
    cleanliness_rating DECIMAL(2, 1) CHECK (cleanliness_rating BETWEEN 1 AND 5),
    location_rating DECIMAL(2, 1) CHECK (location_rating BETWEEN 1 AND 5),
    
    -- Content
    title VARCHAR(255),
    comment TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Media
    image_urls TEXT[] DEFAULT '{}',
    
    -- Response
    supplier_response TEXT,
    supplier_response_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    approved BOOLEAN DEFAULT false,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    report_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_revieweable ON reviews(reviewable_type, reviewable_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

-- =============================================================================
-- 46. SUPPLIER NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS supplier_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'new_booking', 'booking_cancelled', 'payment_received', 'review_received',
        'booking_confirmed', 'customer_message', 'system_update', 'alert'
    )),
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_type VARCHAR(50),
    related_id UUID,
    booking_id UUID REFERENCES bookings(id),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Actions
    action_url TEXT,
    action_label VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_notifications_supplier ON supplier_notifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_read ON supplier_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_created ON supplier_notifications(created_at DESC);

-- =============================================================================
-- 47. SUPPLIER BANK DETAILS
-- =============================================================================
CREATE TABLE IF NOT EXISTS supplier_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    
    -- Amount details
    gross_amount DECIMAL(12, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    net_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'paid', 'failed', 'cancelled'
    )),
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Period
    period_start DATE,
    period_end DATE,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payouts_supplier ON supplier_payouts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON supplier_payouts(status);

-- =============================================================================
-- 48. SUPPLIER ANALYTICS
-- =============================================================================
CREATE TABLE IF NOT EXISTS supplier_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_analytics_supplier ON supplier_analytics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_analytics_date ON supplier_analytics(date);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update supplier stats when product is added/removed
CREATE OR REPLACE FUNCTION update_supplier_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE suppliers SET total_products = total_products + 1 WHERE id = NEW.supplier_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE suppliers SET total_products = total_products - 1 WHERE id = OLD.supplier_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_supplier_product_count
    AFTER INSERT OR DELETE ON supplier_products
    FOR EACH ROW
    EXECUTE FUNCTION update_supplier_product_count();

-- Calculate average rating after review
CREATE OR REPLACE FUNCTION update_reviewable_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.reviewable_type = 'supplier' THEN
            UPDATE suppliers SET 
                average_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE reviewable_type = 'supplier' AND reviewable_id = NEW.reviewable_id AND approved = true),
                total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewable_type = 'supplier' AND reviewable_id = NEW.reviewable_id AND approved = true)
            WHERE id = NEW.reviewable_id;
        ELSIF NEW.reviewable_type = 'product' THEN
            UPDATE supplier_products SET 
                average_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE reviewable_type = 'product' AND reviewable_id = NEW.reviewable_id AND approved = true)
            WHERE id = NEW.reviewable_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.reviewable_type = 'supplier' THEN
            UPDATE suppliers SET 
                average_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE reviewable_type = 'supplier' AND reviewable_id = OLD.reviewable_id AND approved = true),
                total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewable_type = 'supplier' AND reviewable_id = OLD.reviewable_id AND approved = true)
            WHERE id = OLD.reviewable_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviewable_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    WHEN (NEW.approved = true OR OLD.approved = true)
    EXECUTE FUNCTION update_reviewable_rating();

-- =============================================================================
-- SEED DATA: Sample Suppliers
-- =============================================================================

INSERT INTO suppliers (
    company_name, supplier_type, description, status, country, city,
    contact_email, contact_phone, commission_rate, verification_status
) VALUES
    ('Mara Serena Safari Lodge', 'lodge', 'Luxury safari lodge overlooking the Masai Mara', 'approved', 'Kenya', 'Masai Mara',
     'reservations@maraserena.com', '+254 20 123 4567', 12.00, 'verified'),
    ('WildAfrica Tours', 'safari_operator', 'Premium safari experiences since 1995', 'approved', 'Kenya', 'Nairobi',
     'info@wildafrica.com', '+254 20 987 6543', 15.00, 'verified'),
    ('Gorilla Guardians Uganda', 'tour_guide', 'Expert mountain gorilla trekking tours', 'approved', 'Uganda', 'Kampala',
     'bookings@gorillaguardians.com', '+256 41 234 5678', 15.00, 'verified'),
    ('Zanzibar Pearl Hotel', 'hotel', 'Beachfront luxury in Zanzibar', 'approved', 'Tanzania', 'Zanzibar',
     'stay@zanzibarpearl.com', '+255 24 123 4567', 12.00, 'verified'),
    ('Savanna Transport Co', 'transport_company', 'Luxury safari vehicles and transfers', 'approved', 'Kenya', 'Nairobi',
     'bookings@savannatransport.com', '+254 20 456 7890', 10.00, 'verified'),
    ('Acacia Adventure Activities', 'activity_provider', 'Balloon safaris, game drives, and more', 'pending', 'Kenya', 'Masai Mara',
     'info@acaciaadventures.com', '+254 20 789 0123', 15.00, 'documents_submitted')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: Sample Supplier Products
-- =============================================================================

INSERT INTO supplier_products (
    supplier_id, product_type, title, short_description, base_price,
    duration_days, status, availability_type
)
SELECT 
    s.id,
    'package',
    '3 Day Masai Mara Classic Safari',
    'Experience the wonders of the Masai Mara on this compact safari',
    1200.00,
    3,
    'approved',
    'on_request'
FROM suppliers s WHERE s.company_name = 'WildAfrica Tours'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (
    supplier_id, product_type, title, short_description, base_price,
    duration_days, status, availability_type
)
SELECT 
    s.id,
    'accommodation',
    'Luxury Suite - Mara Serena',
    'Spacious suite with panoramic savanna views',
    450.00,
    1,
    'approved',
    'always'
FROM suppliers s WHERE s.company_name = 'Mara Serena Safari Lodge'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF SUPPLIER ECOSYSTEM SCHEMA
-- =============================================================================
