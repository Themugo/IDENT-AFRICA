-- =============================================================================
-- PAYMENT ENGINE - Database Schema
-- =============================================================================

-- =============================================================================
-- 49. PAYMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID REFERENCES users(id),
    
    -- Payment Provider
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('mpesa', 'flutterwave', 'stripe', 'paypal', 'bank_transfer')),
    payment_method VARCHAR(50),
    
    -- Transaction Details
    transaction_reference VARCHAR(255) UNIQUE,
    provider_transaction_id VARCHAR(255),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'
    )),
    
    -- Provider Response
    gateway_response JSONB,
    callback_data JSONB,
    
    -- Phone Number (for M-Pesa)
    phone_number VARCHAR(20),
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(255),
    
    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- =============================================================================
-- 50. TRANSACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id),
    booking_id UUID REFERENCES bookings(id),
    supplier_id UUID REFERENCES suppliers(id),
    
    -- Transaction Type
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'payment', 'commission', 'refund', 'payout', 'charge', 'adjustment'
    )),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Description
    description TEXT,
    
    -- Reference
    reference VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed', 'cancelled'
    )),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- =============================================================================
-- 51. SUPPLIER_PAYOUTS TABLE (Enhanced)
-- =============================================================================
CREATE TABLE IF NOT EXISTS supplier_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Booking reference
    booking_id UUID REFERENCES bookings(id),
    
    -- Amount Details
    gross_amount DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Commission Breakdown
    platform_fee DECIMAL(12, 2) NOT NULL,
    processing_fee DECIMAL(12, 2) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'paid', 'failed', 'cancelled', 'on_hold'
    )),
    
    -- Payment Details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Bank Details (for payout)
    bank_name VARCHAR(100),
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_swift_code VARCHAR(20),
    
    -- Period
    period_start DATE,
    period_end DATE,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payouts_supplier ON supplier_payouts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON supplier_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_paid ON supplier_payouts(paid_at);

-- =============================================================================
-- 52. INVOICES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Reference
    booking_id UUID REFERENCES bookings(id),
    payment_id UUID REFERENCES payments(id),
    customer_id UUID REFERENCES customers(id),
    
    -- Type
    type VARCHAR(20) DEFAULT 'receipt' CHECK (type IN (
        'receipt', 'invoice', 'proforma', 'refund', 'statement'
    )),
    
    -- Amount
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Paid Amount (for partial payments)
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'issued', 'paid', 'partial', 'overdue', 'cancelled'
    )),
    
    -- Due Date
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Content
    items JSONB DEFAULT '[]',
    notes TEXT,
    
    -- PDF
    pdf_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- =============================================================================
-- 53. REFUNDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    booking_id UUID REFERENCES bookings(id),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Reason
    reason VARCHAR(100) CHECK (reason IN (
        'customer_request', 'duplicate', 'fraudulent', 'service_issue', 'cancellation', 'other'
    )),
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
    )),
    
    -- Provider refund
    provider_refund_id VARCHAR(255),
    
    -- Processed
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Approved by
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- =============================================================================
-- 54. PAYMENT_PROVIDERS CONFIGURATION
-- =============================================================================
CREATE TABLE IF NOT EXISTS payment_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) UNIQUE NOT NULL CHECK (provider IN ('mpesa', 'flutterwave', 'stripe', 'paypal', 'bank_transfer')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Priority (lower = higher priority)
    priority INTEGER DEFAULT 100,
    
    -- Configuration
    config JSONB DEFAULT '{}',
    environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    
    -- Limits
    min_amount DECIMAL(12, 2) DEFAULT 1,
    max_amount DECIMAL(12, 2),
    supported_currencies TEXT[] DEFAULT '{}',
    
    -- Metadata
    name VARCHAR(100),
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default providers
INSERT INTO payment_providers (provider, name, priority, is_default, supported_currencies, min_amount) VALUES
    ('mpesa', 'M-Pesa', 1, true, ARRAY['KES'], 100),
    ('flutterwave', 'Flutterwave', 2, false, ARRAY['USD', 'EUR', 'GBP', 'NGN', 'KES', 'TZS', 'UGX'], 1),
    ('stripe', 'Stripe', 3, false, ARRAY['USD', 'EUR', 'GBP'], 1)
ON CONFLICT (provider) DO NOTHING;

-- =============================================================================
-- 55. PAYMENT_LOGS TABLE (Audit)
-- =============================================================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id),
    
    -- Event
    event VARCHAR(50) NOT NULL,
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error')),
    
    -- Details
    message TEXT,
    data JSONB DEFAULT '{}',
    
    -- Source
    source VARCHAR(50) DEFAULT 'system',
    ip_address INET,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event ON payment_logs(event);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created ON payment_logs(created_at DESC);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || 
            TO_CHAR(NOW(), 'YYYY') || '-' ||
            LPAD(NEXTVAL('invoice_sequence')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

CREATE TRIGGER trg_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- Update payment status after completion
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        NEW.completed_at := NOW();
        
        -- Update booking status
        UPDATE bookings SET 
            status = 'confirmed',
            confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.booking_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_completed
    AFTER UPDATE OF payment_status ON payments
    FOR EACH ROW
    WHEN (NEW.payment_status = 'completed' AND OLD.payment_status != 'completed')
    EXECUTE FUNCTION update_payment_status();

-- Create commission transaction on payment completion
CREATE OR REPLACE FUNCTION create_commission_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_commission_rate DECIMAL(5, 2);
    v_commission_amount DECIMAL(12, 2);
    v_net_amount DECIMAL(12, 2);
    v_supplier_id UUID;
BEGIN
    IF NEW.payment_status = 'completed' THEN
        -- Get supplier from package
        SELECT p.supplier_id, COALESCE(s.commission_rate, 15)
        INTO v_supplier_id, v_commission_rate
        FROM bookings b
        JOIN packages pkg ON b.package_id = pkg.id
        JOIN destinations d ON b.destination_id = d.id
        LEFT JOIN suppliers s ON d.supplier_id = s.id
        WHERE b.id = NEW.booking_id;
        
        -- Calculate commission
        v_commission_amount := NEW.amount * (v_commission_rate / 100);
        v_net_amount := NEW.amount - v_commission_amount;
        
        -- Create commission transaction
        IF v_supplier_id IS NOT NULL THEN
            INSERT INTO transactions (
                payment_id, booking_id, supplier_id, type, amount, currency,
                description, status, processed_at
            ) VALUES (
                NEW.id, NEW.booking_id, v_supplier_id, 'commission',
                v_commission_amount, NEW.currency,
                'Platform commission (' || v_commission_rate || '%)', 'completed', NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_commission
    AFTER UPDATE OF payment_status ON payments
    FOR EACH ROW
    WHEN (NEW.payment_status = 'completed' AND OLD.payment_status != 'completed')
    EXECUTE FUNCTION create_commission_transaction();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Payment summary by status
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    payment_status,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    currency
FROM payments
WHERE payment_status = 'completed'
GROUP BY payment_status, currency;

-- Daily revenue
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    currency
FROM payments
WHERE payment_status = 'completed'
GROUP BY DATE(created_at), currency
ORDER BY date DESC;

-- Pending payouts
CREATE OR REPLACE VIEW pending_payouts AS
SELECT 
    sp.id,
    sp.supplier_id,
    s.company_name,
    SUM(sp.net_amount) as total_pending,
    COUNT(*) as payout_count,
    sp.status
FROM supplier_payouts sp
JOIN suppliers s ON sp.supplier_id = s.id
WHERE sp.status IN ('pending', 'processing')
GROUP BY sp.id, sp.supplier_id, s.company_name, sp.status;

-- =============================================================================
-- SEED: Sample Payments
-- =============================================================================

-- Sample payment records (for testing)
INSERT INTO payments (
    booking_id, provider, amount, currency, payment_status, transaction_reference
) 
SELECT 
    b.id,
    'mpesa',
    b.total_amount,
    b.currency,
    CASE 
        WHEN b.status = 'completed' THEN 'completed'
        WHEN b.status = 'confirmed' THEN 'completed'
        ELSE 'pending'
    END,
    'MPX' || TO_CHAR(NOW(), 'YYYYMMDD') || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)
FROM bookings b
LIMIT 5
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF PAYMENT ENGINE SCHEMA
-- =============================================================================
