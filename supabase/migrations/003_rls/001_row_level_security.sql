-- =============================================================================
-- IDENT AFRICA - Row Level Security (RLS) Policies
-- =============================================================================
-- These policies enforce data isolation at the database level
-- Users can only access their own data based on their role
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_homepage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoted_listings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('app.current_user_role', true))::user_role,
        'customer'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_user_id', true),
        NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's supplier_id
CREATE OR REPLACE FUNCTION get_current_supplier_id()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_supplier_id', true),
        NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() IN ('super_admin', 'admin', 'content_manager', 'finance_manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is supplier
CREATE OR REPLACE FUNCTION is_supplier()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = 'supplier';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = 'customer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can read their own profile
CREATE POLICY users_select_own
ON users FOR SELECT
USING (
    is_admin() OR
    id = get_current_user_id()
);

-- Users can update their own profile
CREATE POLICY users_update_own
ON users FOR UPDATE
USING (
    is_admin() OR
    id = get_current_user_id()
);

-- Only admins can insert users
CREATE POLICY users_insert_admin
ON users FOR INSERT
WITH CHECK (is_admin());

-- Only admins can delete users
CREATE POLICY users_delete_admin
ON users FOR DELETE
USING (is_admin());

-- =============================================================================
-- SUPPLIERS TABLE POLICIES
-- =============================================================================

-- Admins can read all suppliers
CREATE POLICY suppliers_select_admin
ON suppliers FOR SELECT
USING (is_admin());

-- Suppliers can read their own data
CREATE POLICY suppliers_select_own
ON suppliers FOR SELECT
USING (
    is_supplier() AND
    id = get_current_supplier_id()
);

-- Only admins can insert suppliers
CREATE POLICY suppliers_insert_admin
ON suppliers FOR INSERT
WITH CHECK (is_admin());

-- Admins can update any supplier
CREATE POLICY suppliers_update_admin
ON suppliers FOR UPDATE
USING (is_admin());

-- Suppliers can update their own data
CREATE POLICY suppliers_update_own
ON suppliers FOR UPDATE
USING (
    is_supplier() AND
    id = get_current_supplier_id()
);

-- Only admins can delete suppliers
CREATE POLICY suppliers_delete_admin
ON suppliers FOR DELETE
USING (is_admin());

-- =============================================================================
-- BOOKINGS TABLE POLICIES
-- =============================================================================

-- Admins can read all bookings
CREATE POLICY bookings_select_admin
ON bookings FOR SELECT
USING (is_admin());

-- Suppliers can read bookings for their packages
CREATE POLICY bookings_select_supplier
ON bookings FOR SELECT
USING (
    is_supplier() AND
    id IN (
        SELECT b.id FROM bookings b
        JOIN booking_items bi ON b.id = bi.booking_id
        JOIN packages p ON bi.package_id = p.id
        WHERE p.supplier_id = get_current_supplier_id()
    )
);

-- Customers can read their own bookings
CREATE POLICY bookings_select_customer
ON bookings FOR SELECT
USING (
    is_customer() AND
    user_id = get_current_user_id()
);

-- Admins can insert bookings
CREATE POLICY bookings_insert_admin
ON bookings FOR INSERT
WITH CHECK (is_admin());

-- Admins can update bookings
CREATE POLICY bookings_update_admin
ON bookings FOR UPDATE
USING (is_admin());

-- Suppliers can update their bookings
CREATE POLICY bookings_update_supplier
ON bookings FOR UPDATE
USING (
    is_supplier() AND
    id IN (
        SELECT b.id FROM bookings b
        JOIN booking_items bi ON b.id = bi.booking_id
        JOIN packages p ON bi.package_id = p.id
        WHERE p.supplier_id = get_current_supplier_id()
    )
);

-- =============================================================================
-- PACKAGES TABLE POLICIES
-- =============================================================================

-- Everyone can read published packages
CREATE POLICY packages_select_public
ON packages FOR SELECT
USING (
    status = 'published' OR
    is_admin() OR
    (is_supplier() AND supplier_id = get_current_supplier_id())
);

-- Admins can insert packages
CREATE POLICY packages_insert_admin
ON packages FOR INSERT
WITH CHECK (is_admin());

-- Admins can update packages
CREATE POLICY packages_update_admin
ON packages FOR UPDATE
USING (is_admin());

-- Suppliers can update their own packages
CREATE POLICY packages_update_supplier
ON packages FOR UPDATE
USING (
    is_supplier() AND
    supplier_id = get_current_supplier_id()
);

-- Only admins can delete packages
CREATE POLICY packages_delete_admin
ON packages FOR DELETE
USING (is_admin());

-- =============================================================================
-- PAYMENT_TRANSACTIONS TABLE POLICIES
-- =============================================================================

-- Admins can read all transactions
CREATE POLICY payments_select_admin
ON payment_transactions FOR SELECT
USING (is_admin());

-- Finance managers can read all transactions
CREATE POLICY payments_select_finance
ON payment_transactions FOR SELECT
USING (get_current_user_role() = 'finance_manager');

-- Customers can read their own transactions
CREATE POLICY payments_select_customer
ON payment_transactions FOR SELECT
USING (
    user_id = get_current_user_id()
);

-- Admins can insert transactions
CREATE POLICY payments_insert_admin
ON payment_transactions FOR INSERT
WITH CHECK (is_admin());

-- =============================================================================
-- REVIEWS TABLE POLICIES
-- =============================================================================

-- Everyone can read approved reviews
CREATE POLICY reviews_select_public
ON reviews FOR SELECT
USING (
    is_approved = TRUE OR
    is_admin() OR
    (is_customer() AND user_id = get_current_user_id())
);

-- Customers can insert their own reviews
CREATE POLICY reviews_insert_customer
ON reviews FOR INSERT
WITH CHECK (
    is_customer() AND
    user_id = get_current_user_id()
);

-- Admins can update reviews
CREATE POLICY reviews_update_admin
ON reviews FOR UPDATE
USING (is_admin());

-- =============================================================================
-- SAVED_DESTINATIONS TABLE POLICIES
-- =============================================================================

-- Customers can read their own saved destinations
CREATE POLICY saved_select_own
ON saved_destinations FOR SELECT
USING (
    user_id = get_current_user_id() OR
    is_admin()
);

-- Customers can insert their own saved destinations
CREATE POLICY saved_insert_own
ON saved_destinations FOR INSERT
WITH CHECK (
    user_id = get_current_user_id()
);

-- Customers can delete their own saved destinations
CREATE POLICY saved_delete_own
ON saved_destinations FOR DELETE
USING (
    user_id = get_current_user_id()
);

-- =============================================================================
-- CMS TABLES POLICIES
-- =============================================================================

-- Admins and content managers can manage CMS
CREATE POLICY cms_select_admin
ON cms_homepage FOR SELECT
USING (is_admin());

CREATE POLICY cms_insert_admin
ON cms_homepage FOR INSERT
WITH CHECK (is_admin() OR get_current_user_role() = 'content_manager');

CREATE POLICY cms_update_admin
ON cms_homepage FOR UPDATE
USING (is_admin() OR get_current_user_role() = 'content_manager');

CREATE POLICY cms_delete_admin
ON cms_homepage FOR DELETE
USING (is_admin());

-- CMS Media
CREATE POLICY cms_media_select_auth
ON cms_media FOR SELECT
USING (is_admin());

CREATE POLICY cms_media_insert_admin
ON cms_media FOR INSERT
WITH CHECK (is_admin() OR get_current_user_role() = 'content_manager');

CREATE POLICY cms_media_delete_admin
ON cms_media FOR DELETE
USING (is_admin());

-- =============================================================================
-- MONETIZATION TABLE POLICIES
-- =============================================================================

-- Finance managers and admins can view commission rules
CREATE POLICY commission_select_admin
ON commission_rules FOR SELECT
USING (
    is_admin() OR
    get_current_user_role() = 'finance_manager'
);

-- Only admins can modify commission rules
CREATE POLICY commission_admin
ON commission_rules FOR ALL
USING (is_admin());

-- Admins can manage subscriptions
CREATE POLICY subscriptions_admin
ON supplier_subscriptions FOR ALL
USING (is_admin());

-- Admins can manage promotions
CREATE POLICY promotions_admin
ON promoted_listings FOR ALL
USING (is_admin());

-- Suppliers can view their own promotions
CREATE POLICY promotions_select_supplier
ON promoted_listings FOR SELECT
USING (
    is_supplier() AND
    supplier_id = get_current_supplier_id()
);

-- =============================================================================
-- SECURITY LOGS (Audit)
-- =============================================================================

-- Only admins can view audit logs
CREATE POLICY audit_logs_select_admin
ON audit_logs FOR SELECT
USING (is_admin());

-- System can insert audit logs
CREATE POLICY audit_logs_insert_system
ON audit_logs FOR INSERT
WITH CHECK (TRUE); -- Always allow inserts, controlled by application

-- =============================================================================
-- GRANT ROLES
-- =============================================================================

-- Create application role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    
    -- Grant necessary permissions
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
END $$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- List all RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname = 'public';

-- Check RLS status on all tables
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
