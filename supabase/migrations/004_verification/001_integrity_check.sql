-- =============================================================================
-- IDENT AFRICA - Database Integrity Verification
-- =============================================================================
-- Run this script to verify data integrity before production deployment
-- =============================================================================

-- =============================================================================
-- ORPHAN RECORD CHECKS
-- =============================================================================

-- 1. Check for orphan packages (no valid supplier)
SELECT 
    'ORPHAN: Packages without supplier' AS check_name,
    COUNT(*) AS count,
    'WARNING: Some packages may have invalid supplier references' AS message
FROM packages p
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.supplier_id IS NOT NULL AND s.id IS NULL;

-- 2. Check for orphan bookings (no valid user)
SELECT 
    'ORPHAN: Bookings without user' AS check_name,
    COUNT(*) AS count
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
WHERE b.user_id IS NOT NULL AND u.id IS NULL;

-- 3. Check for orphan reviews (no valid user or package)
SELECT 
    'ORPHAN: Reviews without user' AS check_name,
    COUNT(*) AS count
FROM reviews r
LEFT JOIN users u ON r.user_id = u.id
WHERE r.user_id IS NOT NULL AND u.id IS NULL;

SELECT 
    'ORPHAN: Reviews without package' AS check_name,
    COUNT(*) AS count
FROM reviews r
LEFT JOIN packages p ON r.package_id = p.id
WHERE r.package_id IS NOT NULL AND p.id IS NULL;

-- 4. Check for orphan booking items (no valid booking or package)
SELECT 
    'ORPHAN: Booking items without booking' AS check_name,
    COUNT(*) AS count
FROM booking_items bi
LEFT JOIN bookings b ON bi.booking_id = b.id
WHERE bi.booking_id IS NOT NULL AND b.id IS NULL;

SELECT 
    'ORPHAN: Booking items without package' AS check_name,
    COUNT(*) AS count
FROM booking_items bi
LEFT JOIN packages p ON bi.package_id = p.id
WHERE bi.package_id IS NOT NULL AND p.id IS NULL;

-- 5. Check for orphan payment transactions (no valid booking)
SELECT 
    'ORPHAN: Payments without booking' AS check_name,
    COUNT(*) AS count
FROM payment_transactions pt
LEFT JOIN bookings b ON pt.booking_id = b.id
WHERE pt.booking_id IS NOT NULL AND b.id IS NULL;

-- =============================================================================
-- DUPLICATE RECORD CHECKS
-- =============================================================================

-- 1. Duplicate email addresses in users
SELECT 
    'DUPLICATE: Users with same email' AS check_name,
    email,
    COUNT(*) AS count
FROM users
WHERE email IS NOT NULL AND email != ''
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Duplicate company names in suppliers
SELECT 
    'DUPLICATE: Suppliers with same company name' AS check_name,
    company_name,
    COUNT(*) AS count
FROM suppliers
WHERE company_name IS NOT NULL AND company_name != ''
GROUP BY company_name
HAVING COUNT(*) > 1;

-- 3. Duplicate destination names
SELECT 
    'DUPLICATE: Destinations with same name' AS check_name,
    name,
    COUNT(*) AS count
FROM destinations
WHERE name IS NOT NULL AND name != ''
GROUP BY name
HAVING COUNT(*) > 1;

-- 4. Duplicate package names for same destination
SELECT 
    'DUPLICATE: Packages with same name in destination' AS check_name,
    destination_id,
    name,
    COUNT(*) AS count
FROM packages
WHERE name IS NOT NULL AND name != ''
GROUP BY destination_id, name
HAVING COUNT(*) > 1;

-- 5. Duplicate payment transaction IDs
SELECT 
    'DUPLICATE: Payment transaction_id' AS check_name,
    COUNT(*) AS count
FROM payment_transactions
WHERE transaction_id IS NOT NULL AND transaction_id != ''
GROUP BY transaction_id
HAVING COUNT(*) > 1;

-- =============================================================================
-- DATA VALIDATION CHECKS
-- =============================================================================

-- 1. Users with invalid email format
SELECT 
    'VALIDATION: Users with invalid email' AS check_name,
    COUNT(*) AS count
FROM users
WHERE email IS NOT NULL 
AND email != ''
AND email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- 2. Bookings with negative amounts
SELECT 
    'VALIDATION: Bookings with negative total' AS check_name,
    COUNT(*) AS count
FROM bookings
WHERE total_amount < 0;

-- 3. Packages with zero or negative price
SELECT 
    'VALIDATION: Packages with invalid price' AS check_name,
    COUNT(*) AS count
FROM packages
WHERE price_per_person <= 0;

-- 4. Reviews with invalid rating
SELECT 
    'VALIDATION: Reviews with invalid rating' AS check_name,
    COUNT(*) AS count
FROM reviews
WHERE rating < 1 OR rating > 5;

-- 5. Suppliers without required fields
SELECT 
    'VALIDATION: Suppliers missing required fields' AS check_name,
    COUNT(*) AS count
FROM suppliers
WHERE company_name IS NULL OR email IS NULL OR country IS NULL;

-- =============================================================================
-- SECURITY CHECKS
-- =============================================================================

-- 1. Check RLS status on all tables
SELECT 
    'RLS: Tables without Row Level Security' AS check_name,
    COUNT(*) AS count,
    string_agg(tablename, ', ') AS tables_without_rls
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT tablename FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename
);

-- 2. Check for tables without any policies
SELECT 
    'SECURITY: Tables without policies' AS check_name,
    tablename AS table_name
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
)
AND tablename NOT IN (
    -- Tables that can be public
    'spatial_ref_sys', 'geography_columns', 'geometry_columns',
    'pg_roles', 'pg_user', 'information_schema'
);

-- =============================================================================
-- DATA QUALITY SUMMARY
-- =============================================================================

SELECT 
    'SUMMARY' AS category,
    'Total Users' AS metric,
    COUNT(*)::text AS value
FROM users
UNION ALL
SELECT 'SUMMARY', 'Total Suppliers', COUNT(*)::text FROM suppliers
UNION ALL
SELECT 'SUMMARY', 'Total Bookings', COUNT(*)::text FROM bookings
UNION ALL
SELECT 'SUMMARY', 'Total Packages', COUNT(*)::text FROM packages
UNION ALL
SELECT 'SUMMARY', 'Total Destinations', COUNT(*)::text FROM destinations
UNION ALL
SELECT 'SUMMARY', 'Total Payments', COUNT(*)::text FROM payment_transactions
UNION ALL
SELECT 'SUMMARY', 'Total Reviews', COUNT(*)::text FROM reviews
UNION ALL
SELECT 'SUMMARY', 'RLS Policies', COUNT(*)::text FROM pg_policies WHERE schemaname = 'public';

-- =============================================================================
-- PERFORMANCE INDEX CHECKS
-- =============================================================================

SELECT 
    'INDEX: Missing indexes on foreign keys' AS check_name,
    COUNT(*) AS count,
    'Consider adding indexes on frequently queried foreign keys' AS recommendation
FROM pg_constraint fc
JOIN pg_class c ON fc.confrelid = c.oid
WHERE fc.contype = 'f'
AND c.relname IN ('bookings', 'packages', 'users', 'suppliers')
AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = fc.conrelid
    AND i.indkey::integer[] @> fc.conkey::integer[]
);
