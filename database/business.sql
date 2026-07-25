-- =============================================================================
-- BUSINESS OPERATIONS - Database Schema
-- =============================================================================

-- =============================================================================
-- 33. USER ROLES & PERMISSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default roles
INSERT INTO user_roles (name, description, permissions) VALUES
    ('super_admin', 'Full platform access', '["*"]'),
    ('content_manager', 'Website and content management', '["content.read", "content.write", "content.delete", "media.read", "media.write"]'),
    ('booking_manager', 'Booking and reservation management', '["bookings.read", "bookings.write", "customers.read", "payments.read"]'),
    ('supplier_manager', 'Supplier operations', '["suppliers.read", "suppliers.write", "products.read"]'),
    ('viewer', 'Read-only access', '["*.read"]')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 34. SYSTEM SETTINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    label VARCHAR(255),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brand settings
INSERT INTO system_settings (category, key, value, label, description, is_public) VALUES
    ('brand', 'logo_url', '"https://example.com/logo.png"', 'Logo URL', 'Main website logo', true),
    ('brand', 'favicon_url', '"https://example.com/favicon.ico"', 'Favicon URL', 'Website favicon', true),
    ('brand', 'primary_color', '"#F59E0B"', 'Primary Color', 'Brand primary color (amber)', false),
    ('brand', 'secondary_color', '"#1C1917"', 'Secondary Color', 'Brand secondary color (stone)', false),
    ('business', 'company_name', '"IDENT Africa"', 'Company Name', 'Legal company name', true),
    ('business', 'contact_email', '"info@identafrica.com"', 'Contact Email', 'Primary contact email', true),
    ('business', 'contact_phone', '"+254700000000"', 'Contact Phone', 'Primary contact phone', true),
    ('business', 'address', '"Nairobi, Kenya"', 'Address', 'Business address', true),
    ('business', 'currency', '"USD"', 'Currency', 'Default pricing currency', false),
    ('business', 'tax_rate', '15', 'Tax Rate', 'Default tax rate percentage', false),
    ('booking', 'min_advance_days', '7', 'Minimum Advance Booking', 'Days in advance for booking', false),
    ('booking', 'max_advance_days', '365', 'Maximum Advance Booking', 'Max days ahead for booking', false),
    ('booking', 'cancellation_days', '14', 'Cancellation Notice', 'Days before for free cancellation', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 35. BOOKINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    package_id UUID REFERENCES packages(id),
    destination_id UUID REFERENCES destinations(id),
    
    -- Booking details
    travel_date DATE NOT NULL,
    end_date DATE,
    guests INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    
    -- Pricing
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'paid', 'completed', 'cancelled'
    )),
    
    -- Special requests
    special_requests TEXT,
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'website',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- Booking status history
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking ON booking_status_history(booking_id);

-- =============================================================================
-- 36. CUSTOMERS (Enhanced)
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    nationality VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    avatar_url TEXT,
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Preferences
    dietary_requirements TEXT,
    accessibility_needs TEXT,
    preferred_contact VARCHAR(20) DEFAULT 'email',
    
    -- Marketing
    newsletter_subscribed BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Metadata
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    last_booking_date DATE,
    customer_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);

-- =============================================================================
-- 37. PROMOTIONS & DISCOUNTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Type
    type VARCHAR(20) CHECK (type IN ('percentage', 'fixed', 'bogo')),
    
    -- Value
    value DECIMAL(10, 2),
    min_purchase DECIMAL(12, 2) DEFAULT 0,
    max_discount DECIMAL(12, 2),
    
    -- Usage
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    
    -- Validity
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Applies to
    applies_to VARCHAR(50) CHECK (applies_to IN ('all', 'packages', 'destinations', 'accommodation')),
    applicable_ids TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, starts_at, expires_at);

-- =============================================================================
-- 38. ANALYTICS & METRICS
-- =============================================================================
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON site_analytics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON site_analytics(metric_type);

-- Page views
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    page_url TEXT NOT NULL,
    referrer TEXT,
    device_type VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page_url);

-- =============================================================================
-- 39. ACTIVITY LOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);

-- =============================================================================
-- 40. EMAIL QUEUE
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    template_id VARCHAR(100),
    template_data JSONB DEFAULT '{}',
    html_content TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_queue(recipient_email);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || 
                                  SUBSTRING(UPPER(MD5(RANDOM()::TEXT)), 1, 6);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_reference
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_reference();

-- Update customer stats on booking
CREATE OR REPLACE FUNCTION update_customer_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE customers SET
            total_bookings = total_bookings + 1,
            total_spent = total_spent + NEW.total_amount,
            last_booking_date = NEW.travel_date
        WHERE id = NEW.customer_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.customer_id != NEW.customer_id THEN
        UPDATE customers SET
            total_bookings = total_bookings - 1,
            total_spent = total_spent - OLD.total_amount
        WHERE id = OLD.customer_id;
        UPDATE customers SET
            total_bookings = total_bookings + 1,
            total_spent = total_spent + NEW.total_amount,
            last_booking_date = NEW.travel_date
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_booking_stats
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_booking_stats();

-- =============================================================================
-- SEED: Dashboard Metrics (Mock Data)
-- =============================================================================

-- Seed some analytics data
INSERT INTO site_analytics (date, metric_type, metric_value) 
SELECT 
    CURRENT_DATE - i,
    'pageviews',
    (random() * 1000 + 500)::INTEGER
FROM generate_series(0, 30) AS i
ON CONFLICT DO NOTHING;

INSERT INTO site_analytics (date, metric_type, metric_value)
SELECT 
    CURRENT_DATE - i,
    'visitors',
    (random() * 500 + 200)::INTEGER
FROM generate_series(0, 30) AS i
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VIEWS FOR DASHBOARD
-- =============================================================================

CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    -- Today's bookings
    (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE) AS today_bookings,
    
    -- Pending bookings
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
    
    -- Today's revenue
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings 
     WHERE DATE(created_at) = CURRENT_DATE AND status IN ('paid', 'completed')) AS today_revenue,
    
    -- Total customers
    (SELECT COUNT(*) FROM customers) AS total_customers,
    
    -- Active suppliers
    (SELECT COUNT(*) FROM suppliers WHERE status = 'active') AS active_suppliers,
    
    -- This month's revenue
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings 
     WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) 
     AND status IN ('paid', 'completed')) AS month_revenue,
    
    -- Enquiries today
    (SELECT COUNT(*) FROM contact_submissions WHERE DATE(created_at) = CURRENT_DATE) AS today_enquiries;

-- =============================================================================
-- END OF BUSINESS OPERATIONS SCHEMA
-- =============================================================================
