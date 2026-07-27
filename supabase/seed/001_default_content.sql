-- =============================================================================
-- IDENT AFRICA - Default Content Seed Data
-- =============================================================================
-- Pre-loaded content for production deployment
-- This content is marked as 'default' ownership
-- =============================================================================

-- =============================================================================
-- DEFAULT DESTINATIONS
-- =============================================================================

INSERT INTO destinations (
    id,
    name,
    country,
    region,
    description,
    short_description,
    highlights,
    best_time_to_visit,
    typical_duration_days,
    price_from_usd,
    rating,
    reviews_count,
    image_url,
    gallery_images,
    featured,
    status,
    content_status,
    content_ownership,
    can_be_modified,
    show_in_migration
) VALUES
(
    'dest-serengeti-001',
    'Serengeti National Park',
    'Tanzania',
    'Northern Circuit',
    'The Serengeti is a world-renowned safari destination, famous for the annual Great Migration where millions of wildebeest, zebra, and gazelle traverse the plains in search of fresh grazing. This UNESCO World Heritage Site offers unparalleled wildlife viewing opportunities, from big cats prowling the golden grasslands to massive herds of elephants. The endless plains stretch as far as the eye can see, punctuated by iconic acacia trees and rocky outcrops known as kopjes.',
    'Experience the world''s greatest wildlife spectacle',
    '["Great Migration", "Big Five", "Hot Air Balloon Safaris", "Luxury Tented Camps", "Wildebeest Crossing"]',
    '["June to October (Migration)", "January to February (Calving)"]',
    5,
    2500,
    4.95,
    2847,
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200',
    '[
        {"url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", "caption": "Serengeti Plains at Sunset"},
        {"url": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", "caption": "Wildebeest Migration"},
        {"url": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200", "caption": "Big Five Safari"}
    ]'::jsonb,
    true,
    'active',
    'default',
    'system',
    true,
    true
),
(
    'dest-masaimara-001',
    'Masai Mara National Reserve',
    'Kenya',
    'Rift Valley',
    'The Masai Mara is Kenya''s most famous wildlife reserve, sharing an ecosystem with the Serengeti. Known for the dramatic river crossings during the Great Migration and its dense population of big cats, the Mara offers some of the best predator sightings in Africa. The rolling savannah grasslands provide the perfect backdrop for unforgettable safari experiences, complemented by rich Masai cultural heritage.',
    'Where the wild meets the Maasai',
    '["Great Migration", "Big Cat sightings", "Hot Air Balloons", "Maasai Culture", "River Crossings"]',
    '["July to October (Migration)", "November to December (Short Rains)"]',
    4,
    2200,
    4.92,
    3156,
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200',
    '[
        {"url": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", "caption": "Masai Mara at Dawn"},
        {"url": "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200", "caption": "Lion Pride"},
        {"url": "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200", "caption": "Savannah Landscape"}
    ]'::jsonb,
    true,
    'active',
    'default',
    'system',
    true,
    true
),
(
    'dest-ngorongoro-001',
    'Ngorongoro Conservation Area',
    'Tanzania',
    'Northern Circuit',
    'The Ngorongoro Conservation Area is a UNESCO World Heritage Site and one of Africa''s most remarkable natural wonders. This ancient volcanic caldera shelters one of the densest populations of wildlife in Africa. The crater floor, covering 260 square kilometers, offers exceptional game viewing with opportunities to spot the Big Five in a single day. Rich archaeological sites including Olduvai Gorge add a fascinating human history dimension.',
    'World''s largest inactive volcanic caldera',
    '["Big Five", "Crater Floor Safari", "Archaeological Sites", "Flamingo Lakes", "Forest Walks"]',
    '["June to September (Dry Season)", "January to February (Green Season)"]',
    3,
    1800,
    4.89,
    1987,
    'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200',
    '[
        {"url": "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200", "caption": "Ngorongoro Crater"},
        {"url": "https://images.unsplash.com/photo-1570462935919-a5d8f1eb7231?w=1200", "caption": "Crater Wildlife"},
        {"url": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200", "caption": "Flamingo Lake"}
    ]'::jsonb,
    true,
    'active',
    'default',
    'system',
    true,
    true
),
(
    'dest-kruger-001',
    'Kruger National Park',
    'South Africa',
    'Limpopo',
    'South Africa''s premier wildlife destination, Kruger National Park is one of the largest game reserves in Africa. With an unparalleled diversity of wildlife including all the Big Five, excellent infrastructure, and a range of accommodation options, Kruger offers an accessible yet authentic safari experience. The park''s rest camp network and self-drive possibilities make it perfect for independent travelers.',
    'Africa''s premier self-drive safari destination',
    '["Big Five", "Self-Drive Safari", "Bush Walks", "Night Drives", "Community Lodges"]',
    '["May to September (Dry Season)", "Year-round access"]',
    5,
    1200,
    4.78,
    4523,
    'https://images.unsplash.com/photo-1551361415-69c87624334f?w=1200',
    '[
        {"url": "https://images.unsplash.com/photo-1551361415-69c87624334f?w=1200", "caption": "Kruger Sunset"},
        {"url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", "caption": "Kruger Wildlife"},
        {"url": "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200", "caption": "Elephant herds"}
    ]'::jsonb,
    true,
    'active',
    'default',
    'system',
    true,
    true
),
(
    'dest-victoria-falls-001',
    'Victoria Falls',
    'Zimbabwe',
    'Matabeleland North',
    'Known locally as "The Smoke That Thunders," Victoria Falls is one of the Seven Natural Wonders of the World. The sheer power and beauty of this massive waterfall creates a mesmerizing spectacle. Beyond the falls, the surrounding area offers incredible adventure activities, luxury experiences, and rich cultural encounters with local communities.',
    'Witness the smoke that thunders',
    '["Devil''s Pool", "Bungee Jumping", "White Water Rafting", "Sunset Cruises", "Helicopter Tours"]',
    '["February to May (Full Flow)", "August to December (Low Flow Adventures)"]',
    4,
    1500,
    4.85,
    1876,
    'https://images.unsplash.com/photo-1568625365131-079e026a927d?w=1200',
    '[
        {"url": "https://images.unsplash.com/photo-1568625365131-079e026a927d?w=1200", "caption": "Victoria Falls"},
        {"url": "https://images.unsplash.com/photo-1569407228235-9a74484ebacc?w=1200", "caption": "Angel''s Pool"},
        {"url": "https://images.unsplash.com/photo-1570723378638-4f4f2a941a2d?w=1200", "caption": "Sunset Cruise"}
    ]'::jsonb,
    true,
    'active',
    'default',
    'system',
    true,
    true
);

-- =============================================================================
-- DEFAULT PACKAGES
-- =============================================================================

INSERT INTO packages (
    id,
    name,
    destination_id,
    supplier_id,
    description,
    short_description,
    duration_days,
    price_per_person,
    max_capacity,
    highlights,
    included,
    not_included,
    images,
    itinerary,
    status,
    content_status,
    content_ownership,
    can_be_modified,
    show_in_migration
) VALUES
(
    'pkg-classic-serengeti-001',
    'Classic Serengeti Safari',
    'dest-serengeti-001',
    NULL,
    'Experience the ultimate African safari on this carefully crafted 5-day journey through the Serengeti. Witness the Great Migration (seasonal), spot the Big Five, and stay in luxury tented camps overlooking the endless plains. This safari combines wildlife excellence with comfort and authentic bush experiences.',
    '5 days of unforgettable wildlife',
    5,
    2850,
    12,
    '["Game drives in open 4x4 vehicles", "Luxury tented camp accommodation", "All meals included", "Expert safari guide", "Bush walks", "Sundowner cocktails"]',
    '["Accommodation", "All meals", "Park fees", "Game drives", "Airport transfers"]',
    '["International flights", "Travel insurance", "Visa fees", "Personal expenses", "Alcoholic beverages"]',
    '[
        {"day": 1, "title": "Arrival in Tanzania", "description": "Welcome to Tanzania! Transfer to your luxury camp on the edge of the Serengeti. Evening sundowner with views over the plains."},
        {"day": 2, "title": "Serengeti Game Drive", "description": "Full day exploring the central Serengeti. Search for lions, leopards, and elephants."},
        {"day": 3, "title": "Migration Season Special", "description": "During migration season, witness the dramatic river crossings. Year-round, explore the hippo pools and crocodile banks."},
        {"day": 4, "title": "Balloon Safari Option", "description": "Early morning optional hot air balloon safari followed by a champagne breakfast in the bush. Afternoon game drive."},
        {"day": 5, "title": "Final Game Drive & Departure", "description": "Morning game drive before transfer to airstrip for your flight out."}
    ]'::jsonb,
    'published',
    'default',
    'system',
    true,
    true
),
(
    'pkg-masai-mara-001',
    'Masai Mara Big Five Adventure',
    'dest-masaimara-001',
    NULL,
    'Discover Kenya''s most iconic wildlife reserve on this 4-day Big Five safari. The Masai Mara offers exceptional predator sightings and the dramatic Great Migration river crossings. Stay in luxury safari camps, enjoy guided game drives, and immerse yourself in Maasai culture.',
    '4 days of incredible wildlife encounters',
    4,
    2400,
    10,
    '["Big Five game drives", "Maasai cultural visit", "Luxury camp accommodation", "Bush breakfast", "All meals"]',
    '["Accommodation", "All meals", "Park fees", "Game drives", "Cultural visit"]',
    '["International flights", "Travel insurance", "Visa fees", "Optional activities", "Tips"]',
    '[
        {"day": 1, "title": "Welcome to the Mara", "description": "Scenic flight to Masai Mara. Afternoon game drive as the sun sets over the savannah."},
        {"day": 2, "title": "Full Day Mara Safari", "description": "Explore the vast grasslands. High chances of lion, leopard, and cheetah sightings."},
        {"day": 3, "title": "Cultural Immersion", "description": "Morning game drive followed by visit to a traditional Maasai village. Learn about their ancient customs."},
        {"day": 4, "title": "Final Morning & Departure", "description": "Early morning game drive before breakfast and transfer to airstrip."}
    ]'::jsonb,
    'published',
    'default',
    'system',
    true,
    true
),
(
    'pkg-ngorongoro-001',
    'Ngorongoro Crater Safari',
    'dest-ngorongoro-001',
    NULL,
    'Descend into the world''s largest inactive volcanic caldera for unparalleled wildlife viewing. This 3-day safari combines Ngorongoro crater floor adventures with visits to nearby attractions. Perfect for those seeking a concentrated, high-impact safari experience.',
    '3 days in the world''s largest caldera',
    3,
    1950,
    8,
    '["Crater floor game drive", "Lake Ndutu visit", "Coffee plantation tour", "All meals included"]',
    '["Accommodation", "All meals", "Park fees", "Game drives", "Transfers"]',
    '["International flights", "Travel insurance", "Visa fees", "Personal expenses"]',
    '[
        {"day": 1, "title": "Journey to Ngorongoro", "description": "Drive from Arusha, stop at a coffee plantation. Settle into lodge on the crater rim."},
        {"day": 2, "title": "Crater Exploration", "description": "Early descent onto the crater floor. Dense wildlife including hippos, lions, and flamingos."},
        {"day": 3, "title": "Lake Ndutu & Return", "description": "Visit Lake Ndutu for flamingo viewing. Return to Arusha via the highlands."}
    ]'::jsonb,
    'published',
    'default',
    'system',
    true,
    true
);

-- =============================================================================
-- DEFAULT CMS CONTENT
-- =============================================================================

INSERT INTO cms_homepage (id, section, content, status) VALUES
('cms-home-hero', 'hero', '{
    "headline": "Discover Africa''s Wild Heart",
    "subheadline": "Authentic safari experiences crafted by local experts",
    "cta_text": "Start Your Journey",
    "cta_link": "/destinations",
    "video_url": null,
    "background_image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
}'::jsonb, 'published'),

('cms-home-about', 'about', '{
    "title": "Why Choose IDENT AFRICA",
    "content": "We connect travelers with verified African safari operators, ensuring authentic experiences while supporting local communities and conservation efforts.",
    "stats": [
        {"value": "500+", "label": "Verified Suppliers"},
        {"value": "50,000+", "label": "Happy Travelers"},
        {"value": "15", "label": "African Countries"},
        {"value": "98%", "label": "Satisfaction Rate"}
    ]
}'::jsonb, 'published'),

('cms-home-features', 'features', '{
    "title": "The IDENT AFRICA Difference",
    "features": [
        {
            "icon": "shield-check",
            "title": "Verified Suppliers",
            "description": "Every operator is vetted for quality, safety, and ethical practices"
        },
        {
            "icon": "map-pin",
            "title": "Unique Destinations",
            "description": "Beyond the ordinary - discover hidden gems across Africa"
        },
        {
            "icon": "sparkles",
            "title": "AI Trip Planning",
            "description": "Get personalized safari itineraries powered by artificial intelligence"
        },
        {
            "icon": "leaf",
            "title": "Sustainable Travel",
            "description": "Support conservation and local communities with every booking"
        }
    ]
}'::jsonb, 'published');

-- =============================================================================
-- DEFAULT SUPPLIER (System Demo)
-- =============================================================================

INSERT INTO suppliers (
    id,
    company_name,
    email,
    phone,
    country,
    status,
    approval_status,
    is_demo_account,
    content_status,
    content_ownership
) VALUES (
    'sup-system-001',
    'IDENT AFRICA Demo Experiences',
    'demo@identafrical.com',
    '+254 700 000 000',
    'Kenya',
    'active',
    'approved',
    true,
    'default',
    'system'
);

-- Update packages with demo supplier
UPDATE packages SET supplier_id = 'sup-system-001' WHERE supplier_id IS NULL;

-- =============================================================================
-- DEFAULT ADMIN USER (for setup)
-- =============================================================================

-- Note: Password will be set via secure setup process
-- This creates the admin user record
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    status,
    content_status,
    content_ownership,
    is_system_created
) VALUES (
    'admin-system-001',
    'admin@identafrical.com',
    'System Administrator',
    'admin',
    'active',
    'default',
    'system',
    true
);

-- =============================================================================
-- DEFAULT TESTIMONIALS
-- =============================================================================

INSERT INTO reviews (
    id,
    user_id,
    package_id,
    booking_id,
    rating,
    review_text,
    is_approved,
    is_featured,
    created_at,
    content_status,
    content_ownership
) VALUES
('review-001', NULL, 'pkg-classic-serengeti-001', NULL, 5,
 'Absolutely breathtaking experience! The Serengeti exceeded all expectations. Our guide was incredibly knowledgeable and we saw all the Big Five in just two days. The tented camp was luxurious and the food was excellent. Highly recommend!',
 true, true, NOW() - INTERVAL '30 days', 'default', 'system'),

('review-002', NULL, 'pkg-masai-mara-001', NULL, 5,
 'The Masai Mara was magical. Watching the sunset over the savannah with a glass of champagne was unforgettable. The cultural visit to the Maasai village was a highlight - such warm and welcoming people.',
 true, true, NOW() - INTERVAL '45 days', 'default', 'system'),

('review-003', NULL, 'pkg-ngorongoro-001', NULL, 4,
 'The crater is incredible! We saw lions, hippos, and hundreds of flamingos. The only downside was the crowds, but the wildlife viewing was phenomenal. Would definitely recommend combining with a Serengeti trip.',
 true, false, NOW() - INTERVAL '60 days', 'default', 'system');

-- =============================================================================
-- REGISTER DEFAULT CONTENT
-- =============================================================================

INSERT INTO default_content_registry (content_type, content_id, original_data, is_active, can_be_modified, show_in_migration)
SELECT 'destination', id, row_to_json(destinations.*)::text, true, true, true
FROM destinations WHERE content_ownership = 'system';

INSERT INTO default_content_registry (content_type, content_id, original_data, is_active, can_be_modified, show_in_migration)
SELECT 'package', id, row_to_json(packages.*)::text, true, true, true
FROM packages WHERE content_ownership = 'system';

INSERT INTO default_content_registry (content_type, content_id, original_data, is_active, can_be_modified, show_in_migration)
SELECT 'cms_homepage', id, content::text, true, true, true
FROM cms_homepage WHERE content_status = 'default';

INSERT INTO default_content_registry (content_type, content_id, original_data, is_active, can_be_modified, show_in_migration)
SELECT 'supplier', id, row_to_json(suppliers.*)::text, true, false, true
FROM suppliers WHERE is_demo_account = true;

-- =============================================================================
-- SETUP COMPLETE LOG
-- =============================================================================

INSERT INTO content_migrations (
    migration_type,
    status,
    description,
    items_migrated,
    performed_by,
    created_at
) VALUES (
    'initial_seed',
    'completed',
    'Production seed data - Default destinations, packages, CMS content',
    (SELECT COUNT(*) FROM destinations WHERE content_ownership = 'system') +
    (SELECT COUNT(*) FROM packages WHERE content_ownership = 'system') +
    (SELECT COUNT(*) FROM cms_homepage WHERE content_status = 'default'),
    'system',
    NOW()
);
