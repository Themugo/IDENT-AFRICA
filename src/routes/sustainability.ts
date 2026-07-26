/**
 * Sustainability API Routes
 * Environmental impact tracking and eco-travel scoring
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

// Score weights
const SCORE_WEIGHTS = {
  conservation: 0.30,
  community: 0.25,
  wildlife: 0.25,
  carbon: 0.20,
};

// ==================== SUSTAINABILITY SCORES ====================

/**
 * GET /api/sustainability/scores - Get all supplier sustainability scores
 */
router.get('/scores', async (req: Request, res: Response) => {
  try {
    const { filter, minScore, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        scores: [
          {
            supplier_id: 'supp_001',
            overall_score: 88.5,
            sustainability_grade: 'A',
            conservation_score: 90,
            community_score: 85,
            wildlife_score: 92,
            carbon_score: 85,
            eco_badges: ['eco_certified', 'carbon_neutral', 'wildlife_friendly'],
            primary_eco_badge: 'eco_certified',
            conservation_projects: 5,
            acres_protected: 15000,
            trees_planted: 2000,
            community_investment_usd: 25000,
            carbon_neutral: true,
            is_verified: true,
          },
          {
            supplier_id: 'supp_002',
            overall_score: 75.2,
            sustainability_grade: 'B',
            conservation_score: 70,
            community_score: 80,
            wildlife_score: 75,
            carbon_score: 78,
            eco_badges: ['community_support', 'green_partner'],
            primary_eco_badge: 'community_support',
            conservation_projects: 2,
            acres_protected: 5000,
            community_investment_usd: 12000,
            carbon_neutral: false,
            is_verified: true,
          },
          {
            supplier_id: 'supp_003',
            overall_score: 92.0,
            sustainability_grade: 'A',
            conservation_score: 95,
            community_score: 88,
            wildlife_score: 98,
            carbon_score: 85,
            eco_badges: ['eco_certified', 'sustainable_leader', 'wildlife_friendly', 'renewable_energy'],
            primary_eco_badge: 'sustainable_leader',
            conservation_projects: 8,
            acres_protected: 25000,
            trees_planted: 5000,
            animals_protected: 150,
            community_investment_usd: 45000,
            carbon_neutral: true,
            is_verified: true,
          },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM supplier_sustainability WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (minScore) {
      sql += ` AND overall_score >= $${paramIndex++}`;
      params.push(minScore);
    }

    sql += ' ORDER BY overall_score DESC';
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { scores: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching sustainability scores:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch scores'));
  }
});

/**
 * GET /api/sustainability/scores/:supplierId - Get supplier sustainability score
 */
router.get('/scores/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        supplier_id: supplierId,
        overall_score: 85.0,
        sustainability_grade: 'A',
        conservation_score: 88,
        community_score: 82,
        wildlife_score: 90,
        carbon_score: 80,
        eco_badges: ['eco_certified', 'wildlife_friendly'],
        primary_eco_badge: 'eco_certified',
        conservation_projects: 4,
        acres_protected: 12000,
        trees_planted: 1500,
        animals_protected: 85,
        community_projects: 6,
        local_employees: 45,
        local_sourcing_percentage: 75,
        community_investment_usd: 18000,
        total_carbon_offset_kg: 25000,
        monthly_carbon_saved_kg: 1500,
        carbon_neutral: true,
        is_verified: true,
        verification_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        last_audit_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
    }

    const result = await query(
      'SELECT * FROM supplier_sustainability WHERE supplier_id = $1',
      [supplierId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Sustainability score not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching sustainability score:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch score'));
  }
});

/**
 * POST /api/sustainability/scores - Create/Update sustainability profile
 */
router.post('/scores', async (req: Request, res: Response) => {
  try {
    const { supplierId, ...profileData } = req.body;

    if (!supplierId) {
      return res.status(400).json(createResponse(false, undefined, 'Supplier ID required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `sus_${Date.now()}`,
        supplier_id: supplierId,
        overall_score: 75.0,
        sustainability_grade: 'B',
        created: true,
      }));
    }

    // Calculate overall score
    const conservationScore = profileData.conservation_score || 0;
    const communityScore = profileData.community_score || 0;
    const wildlifeScore = profileData.wildlife_score || 0;
    const carbonScore = profileData.carbon_score || 0;

    const overallScore = Math.round(
      (conservationScore * SCORE_WEIGHTS.conservation +
       communityScore * SCORE_WEIGHTS.community +
       wildlifeScore * SCORE_WEIGHTS.wildlife +
       carbonScore * SCORE_WEIGHTS.carbon) * 100
    ) / 100;

    // Determine grade
    let grade = 'D';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';

    // Calculate badges
    const badges = calculateEcoBadges(profileData);

    // Upsert
    const result = await query(
      `INSERT INTO supplier_sustainability (
        supplier_id, overall_score, sustainability_grade,
        conservation_score, community_score, wildlife_score, carbon_score,
        eco_badges, primary_eco_badge,
        conservation_projects, acres_protected, trees_planted, animals_protected,
        community_projects, local_employees, local_sourcing_percentage, community_investment_usd,
        anti_poaching_partnership, wildlife_corridors_maintained, habitat_restoration_sq_km,
        carbon_neutral, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (supplier_id) DO UPDATE SET
        overall_score = $2, sustainability_grade = $3,
        conservation_score = $4, community_score = $5, wildlife_score = $6, carbon_score = $7,
        eco_badges = $8, primary_eco_badge = $9,
        conservation_projects = $10, acres_protected = $11, trees_planted = $12, animals_protected = $13,
        community_projects = $14, local_employees = $15, local_sourcing_percentage = $16, community_investment_usd = $17,
        anti_poaching_partnership = $18, wildlife_corridors_maintained = $19, habitat_restoration_sq_km = $20,
        carbon_neutral = $21, is_verified = $22,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        supplierId, overallScore, grade,
        conservationScore, communityScore, wildlifeScore, carbonScore,
        badges, badges[0] || null,
        profileData.conservation_projects || 0,
        profileData.acres_protected || 0,
        profileData.trees_planted || 0,
        profileData.animals_protected || 0,
        profileData.community_projects || 0,
        profileData.local_employees || 0,
        profileData.local_sourcing_percentage || 0,
        profileData.community_investment_usd || 0,
        profileData.anti_poaching_partnership || false,
        profileData.wildlife_corridors_maintained || false,
        profileData.habitat_restoration_sq_km || 0,
        profileData.carbon_neutral || false,
        profileData.is_verified || false,
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Sustainability profile updated'));
  } catch (error) {
    console.error('Error updating sustainability score:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update score'));
  }
});

// ==================== CONSERVATION PROJECTS ====================

/**
 * GET /api/sustainability/conservation - Get conservation projects
 */
router.get('/conservation', async (req: Request, res: Response) => {
  try {
    const { category, status, country, limit = '50' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        projects: [
          {
            id: 'proj_1',
            name: 'Serengeti Wildlife Corridor',
            description: 'Protecting migration routes for wildebeest and zebra',
            category: 'wildlife',
            location: 'Serengeti, Tanzania',
            country: 'Tanzania',
            area_sq_km: 500,
            target_species: ['wildebeest', 'zebra', 'gazelle'],
            funding_goal_usd: 250000,
            funding_received_usd: 180000,
            status: 'active',
            progress_percentage: 72,
          },
          {
            id: 'proj_2',
            name: 'Maasai Mara Reforestation',
            description: 'Replanting indigenous trees in the Mara ecosystem',
            category: 'forest',
            location: 'Maasai Mara, Kenya',
            country: 'Kenya',
            area_sq_km: 200,
            target_species: [],
            trees_planted: 15000,
            funding_goal_usd: 100000,
            funding_received_usd: 100000,
            status: 'active',
            progress_percentage: 100,
          },
          {
            id: 'proj_3',
            name: 'Mountain Gorilla Conservation',
            description: 'Protecting endangered mountain gorilla habitat',
            category: 'wildlife',
            location: 'Volcanoes National Park, Rwanda',
            country: 'Rwanda',
            area_sq_km: 160,
            target_species: ['mountain_gorilla'],
            funding_goal_usd: 500000,
            funding_received_usd: 350000,
            status: 'active',
            progress_percentage: 70,
          },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM conservation_projects WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (country) {
      sql += ` AND country = $${paramIndex++}`;
      params.push(country);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(Number(limit));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { projects: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching conservation projects:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch projects'));
  }
});

/**
 * POST /api/sustainability/conservation - Create conservation project
 */
router.post('/conservation', async (req: Request, res: Response) => {
  try {
    const { name, description, category, location, country, area_sq_km, target_species, funding_goal_usd, partner_organization } = req.body;

    if (!name) {
      return res.status(400).json(createResponse(false, undefined, 'Project name required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `proj_${Date.now()}`,
        name,
        category,
        status: 'active',
        progress_percentage: 0,
        created_at: new Date().toISOString(),
      }));
    }

    const result = await query(
      `INSERT INTO conservation_projects (
        name, description, category, location, country,
        area_sq_km, target_species, funding_goal_usd,
        partner_organization, status, start_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', CURRENT_DATE)
      RETURNING *`,
      [name, description, category, location, country, area_sq_km, JSON.stringify(target_species || []), funding_goal_usd, partner_organization]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Conservation project created'));
  } catch (error) {
    console.error('Error creating conservation project:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create project'));
  }
});

// ==================== CARBON FOOTPRINT ====================

/**
 * GET /api/sustainability/carbon/:bookingId - Get carbon footprint for booking
 */
router.get('/carbon/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        booking_id: bookingId,
        transport_type: 'flight',
        transport_distance_km: 3500,
        transport_emissions_kg: 892.5,
        accommodation_nights: 5,
        accommodation_emissions_kg: 125,
        activity_emissions_kg: 45,
        total_emissions_kg: 1062.5,
        is_offset: true,
        offset_cost_usd: 15,
        trip_type: 'standard',
      }));
    }

    const result = await query(
      'SELECT * FROM carbon_footprints WHERE booking_id = $1',
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Carbon footprint not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching carbon footprint:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch footprint'));
  }
});

/**
 * POST /api/sustainability/carbon - Calculate carbon footprint
 */
router.post('/carbon', async (req: Request, res: Response) => {
  try {
    const { bookingId, supplierId, customerId, transportType, distanceKm, accommodationNights } = req.body;

    if (!bookingId || !transportType) {
      return res.status(400).json(createResponse(false, undefined, 'Booking ID and transport type required'));
    }

    // Get emission factor
    let emissionFactor = 0.195; // Default flight factor

    if (!isDatabaseConnected()) {
      const totalEmissions = distanceKm * emissionFactor + accommodationNights * 25;
      return res.status(201).json(createResponse(true, {
        booking_id: bookingId,
        transport_type: transportType,
        transport_distance_km: distanceKm,
        transport_emissions_kg: distanceKm * emissionFactor,
        accommodation_nights: accommodationNights,
        accommodation_emissions_kg: accommodationNights * 25,
        total_emissions_kg: totalEmissions,
        trip_type: totalEmissions < 500 ? 'low_carbon' : 'standard',
      }));
    }

    const factorResult = await query(
      `SELECT emission_factor FROM carbon_emission_factors 
       WHERE transport_type = $1 AND is_active = TRUE LIMIT 1`,
      [transportType]
    );

    if (factorResult.rows.length > 0) {
      emissionFactor = parseFloat((factorResult.rows[0] as Record<string, unknown>).emission_factor as string);
    }

    const transportEmissions = (distanceKm || 0) * emissionFactor;
    const accommodationEmissions = (accommodationNights || 0) * 25; // 25kg per night estimate
    const totalEmissions = transportEmissions + accommodationEmissions;

    const result = await query(
      `INSERT INTO carbon_footprints (
        booking_id, supplier_id, customer_id,
        transport_type, transport_distance_km, transport_emissions_kg,
        accommodation_nights, accommodation_emissions_kg,
        total_emissions_kg, trip_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        bookingId, supplierId, customerId,
        transportType, distanceKm, transportEmissions,
        accommodationNights, accommodationEmissions,
        totalEmissions, totalEmissions < 500 ? 'low_carbon' : 'standard',
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Carbon footprint calculated'));
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to calculate footprint'));
  }
});

/**
 * POST /api/sustainability/carbon/offset - Offset carbon emissions
 */
router.post('/carbon/offset', async (req: Request, res: Response) => {
  try {
    const { footprintId, projectId, amount } = req.body;

    if (!footprintId) {
      return res.status(400).json(createResponse(false, undefined, 'Footprint ID required'));
    }

    const offsetCostPerKg = 0.015; // $0.015 per kg CO2

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        footprint_id: footprintId,
        offset_cost_usd: amount || 15,
        offset_certificate_id: `CERT-${Date.now()}`,
        is_offset: true,
        offset_project_id: projectId,
      }));
    }

    const result = await query(
      `UPDATE carbon_footprints SET 
        is_offset = TRUE,
        offset_project_id = $1,
        offset_cost_usd = $2,
        offset_certificate_id = $3
       WHERE id = $4
       RETURNING *`,
      [projectId, amount || 0, `CERT-${Date.now()}`, footprintId]
    );

    res.status(200).json(createResponse(true, result.rows[0], 'Carbon offset purchased'));
  } catch (error) {
    console.error('Error offsetting carbon:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to offset carbon'));
  }
});

// ==================== WILDLIFE INITIATIVES ====================

/**
 * GET /api/sustainability/wildlife - Get wildlife initiatives
 */
router.get('/wildlife', async (req: Request, res: Response) => {
  try {
    const { type, country, status = 'active' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        initiatives: [
          {
            id: 'wild_1',
            name: 'Big Five Anti-Poaching Unit',
            description: 'Rangers protecting elephant, rhino, lion, leopard, buffalo',
            initiative_type: 'anti_poaching',
            location: 'Kruger National Park, South Africa',
            country: 'South Africa',
            species_list: ['elephant', 'rhino', 'lion', 'leopard', 'buffalo'],
            animals_protected: 1250,
            patrol_km: 15000,
            arrests_made: 45,
            status: 'active',
          },
          {
            id: 'wild_2',
            name: 'Sea Turtle Nesting Protection',
            description: 'Protecting endangered sea turtle nesting beaches',
            initiative_type: 'habitat',
            location: 'Zanzibar, Tanzania',
            country: 'Tanzania',
            species_list: ['green_turtle', 'hawksbill_turtle'],
            animals_protected: 850,
            status: 'active',
          },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM wildlife_initiatives WHERE status = $1';
    const params: unknown[] = [status];
    let paramIndex = 2;

    if (type) {
      sql += ` AND initiative_type = $${paramIndex++}`;
      params.push(type);
    }
    if (country) {
      sql += ` AND country = $${paramIndex++}`;
      params.push(country);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { initiatives: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching wildlife initiatives:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch initiatives'));
  }
});

// ==================== ECO BADGES ====================

/**
 * GET /api/sustainability/badges - Get eco badge definitions
 */
router.get('/badges', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        badges: [
          { badge_type: 'eco_certified', name: 'Eco Certified', icon: '🌿', color: '#10B981', description: 'Verified sustainable travel provider' },
          { badge_type: 'carbon_neutral', name: 'Carbon Neutral', icon: '☁️', color: '#06B6D4', description: 'Net zero carbon emissions' },
          { badge_type: 'community_support', name: 'Community Champion', icon: '🤝', color: '#8B5CF6', description: 'Strong community investment' },
          { badge_type: 'wildlife_friendly', name: 'Wildlife Friendly', icon: '🦁', color: '#F59E0B', description: 'Verified wildlife protection' },
          { badge_type: 'sustainable_leader', name: 'Sustainable Leader', icon: '🏆', color: '#EAB308', description: 'Excellence in sustainability' },
        ],
      }));
    }

    const result = await query('SELECT * FROM eco_badge_definitions WHERE is_active = TRUE ORDER BY sort_order');
    res.status(200).json(createResponse(true, { badges: result.rows }));
  } catch (error) {
    console.error('Error fetching eco badges:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch badges'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/sustainability/stats - Get sustainability statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        total_suppliers: 45,
        eco_certified_count: 28,
        carbon_neutral_count: 15,
        total_carbon_offset_kg: 500000,
        total_acres_protected: 250000,
        total_trees_planted: 50000,
        total_community_investment_usd: 750000,
        conservation_projects_count: 35,
        wildlife_initiatives_count: 22,
      }));
    }

    const [supplierStats, conservationStats, carbonStats, communityStats] = await Promise.all([
      query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_verified) as verified, COUNT(*) FILTER (WHERE carbon_neutral) as carbon_neutral, AVG(overall_score) as avg_score FROM supplier_sustainability`),
      query(`SELECT COUNT(*) as count, COALESCE(SUM(acres_protected), 0) as acres, COALESCE(SUM(trees_planted), 0) as trees FROM conservation_projects WHERE status = 'active'`),
      query(`SELECT COALESCE(SUM(total_carbon_offset_kg), 0) as total_offset, COUNT(*) as footprints, COUNT(*) FILTER (WHERE is_offset) as offset_count FROM carbon_footprints`),
      query(`SELECT COALESCE(SUM(community_investment_usd), 0) as total_investment, COALESCE(SUM(local_employees), 0) as employees FROM supplier_sustainability`),
    ]);

    const sStats = supplierStats.rows[0] as Record<string, unknown> || {};
    const cStats = conservationStats.rows[0] as Record<string, unknown> || {};
    const crStats = carbonStats.rows[0] as Record<string, unknown> || {};
    const coStats = communityStats.rows[0] as Record<string, unknown> || {};

    res.status(200).json(createResponse(true, {
      total_suppliers: parseInt(sStats.total as string || '0'),
      eco_certified_count: parseInt(sStats.verified as string || '0'),
      carbon_neutral_count: parseInt(sStats.carbon_neutral as string || '0'),
      avg_sustainability_score: parseFloat(sStats.avg_score as string || '0'),
      total_carbon_offset_kg: parseFloat(crStats.total_offset as string || '0'),
      total_acres_protected: parseFloat((cStats.acres as string) || '0'),
      total_trees_planted: parseInt((cStats.trees as string) || '0'),
      total_community_investment_usd: parseFloat((coStats.total_investment as string) || '0'),
      conservation_projects_count: parseInt(cStats.count as string || '0'),
    }));
  } catch (error) {
    console.error('Error fetching sustainability stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

// ==================== SUSTAINABILITY FILTERS ====================

/**
 * GET /api/sustainability/filters - Get available sustainability filters
 */
router.get('/filters', async (req: Request, res: Response) => {
  try {
    const filters = [
      { id: 'eco_certified', name: 'Eco Certified', icon: '🌿', description: 'Verified sustainable provider' },
      { id: 'carbon_neutral', name: 'Carbon Neutral', icon: '☁️', description: 'Net zero emissions' },
      { id: 'community_support', name: 'Community Support', icon: '🤝', description: 'Invests in local communities' },
      { id: 'wildlife_friendly', name: 'Wildlife Friendly', icon: '🦁', description: 'Protects wildlife' },
      { id: 'local_sourcing', name: 'Local Sourcing', icon: '🏪', description: 'Uses local suppliers' },
      { id: 'renewable_energy', name: 'Renewable Energy', icon: '⚡', description: 'Powered by clean energy' },
      { id: 'plastic_free', name: 'Plastic Free', icon: '🚫', description: 'No single-use plastics' },
      { id: 'low_carbon_transport', name: 'Low Carbon Transport', icon: '🚌', description: 'Eco-friendly transport options' },
    ];

    res.status(200).json(createResponse(true, { filters }));
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch filters'));
  }
});

/**
 * GET /api/sustainability/search - Search suppliers by sustainability filters
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { filters, minScore, limit = '20' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        suppliers: [
          { supplier_id: 'supp_001', name: 'Eco Safari Kenya', overall_score: 92, eco_badges: ['eco_certified', 'carbon_neutral'] },
          { supplier_id: 'supp_003', name: 'Green Tanzania Tours', overall_score: 88, eco_badges: ['eco_certified', 'wildlife_friendly'] },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM supplier_sustainability WHERE 1=1';
    const params: unknown[] = [];

    if (minScore) {
      sql += ' AND overall_score >= $1';
      params.push(minScore);
    }

    if (filters) {
      const filterArray = (filters as string).split(',');
      for (const filter of filterArray) {
        sql += ` AND $${params.length + 1} = ANY(eco_badges)`;
        params.push(filter.trim());
      }
    }

    sql += ` ORDER BY overall_score DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { suppliers: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error searching sustainable suppliers:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to search'));
  }
});

// Helper function to calculate eco badges
function calculateEcoBadges(profile: Record<string, unknown>): string[] {
  const badges: string[] = [];

  if ((profile.overall_score as number) >= 70 && profile.is_verified) {
    badges.push('eco_certified');
  }

  if ((profile.carbon_neutral as boolean)) {
    badges.push('carbon_neutral');
  }

  if ((profile.community_score as number) >= 65 && (profile.community_investment_usd as number) >= 1000) {
    badges.push('community_support');
  }

  if ((profile.wildlife_score as number) >= 70 && (profile.anti_poaching_partnership as boolean)) {
    badges.push('wildlife_friendly');
  }

  if ((profile.conservation_score as number) >= 60) {
    badges.push('green_partner');
  }

  if ((profile.overall_score as number) >= 90 && profile.is_verified && (profile.carbon_neutral as boolean)) {
    badges.push('sustainable_leader');
  }

  return badges.slice(0, 5); // Max 5 badges
}

export default router;
