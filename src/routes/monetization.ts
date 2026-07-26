/**
 * Monetization API Routes
 * Commission, subscription, and promotion management
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

// ==================== COMMISSION SYSTEM ====================

/**
 * GET /api/monetization/commissions/rules - Get all commission rules
 */
router.get('/commissions/rules', async (req: Request, res: Response) => {
  try {
    const { type, active } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        rules: [
          { id: 'cr_1', name: 'Default Global Commission', commission_type: 'global', commission_percentage: 15.00, priority: 0, is_active: true },
          { id: 'cr_2', name: 'Safari Specialists', commission_type: 'supplier_specific', supplier_id: 'sup_001', commission_percentage: 12.00, priority: 10, is_active: true },
          { id: 'cr_3', name: 'Premium Packages', commission_type: 'package_specific', package_id: 'pkg_001', commission_percentage: 18.00, priority: 20, is_active: true },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM commission_rules WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND commission_type = $${paramIndex++}`;
      params.push(type);
    }
    if (active !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(active === 'true');
    }

    sql += ' ORDER BY priority DESC, created_at ASC';

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { rules: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching commission rules:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch commission rules'));
  }
});

/**
 * POST /api/monetization/commissions/rules - Create commission rule
 */
router.post('/commissions/rules', async (req: Request, res: Response) => {
  try {
    const { name, description, commissionType, supplierId, packageId, percentage, minCommission, maxCommission, category, destinationId, startDate, endDate, priority } = req.body;

    if (!name || !commissionType || percentage === undefined) {
      return res.status(400).json(createResponse(false, undefined, 'Name, commission type, and percentage required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `cr_${Date.now()}`,
        name,
        commission_type: commissionType,
        commission_percentage: percentage,
        priority: priority || 0,
        is_active: true,
      }));
    }

    const result = await query(
      `INSERT INTO commission_rules (name, description, commission_type, supplier_id, package_id, commission_percentage, minimum_commission, maximum_commission, category, destination_id, start_date, end_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [name, description, commissionType, supplierId, packageId, percentage, minCommission || 0, maxCommission, category, destinationId, startDate, endDate, priority || 0]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Commission rule created'));
  } catch (error) {
    console.error('Error creating commission rule:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create commission rule'));
  }
});

/**
 * GET /api/monetization/commissions/calculate - Calculate commission for booking
 */
router.post('/commissions/calculate', async (req: Request, res: Response) => {
  try {
    const { bookingAmount, supplierId, packageId, category, destinationId } = req.body;

    if (!bookingAmount) {
      return res.status(400).json(createResponse(false, undefined, 'Booking amount required'));
    }

    if (!isDatabaseConnected()) {
      const amount = parseFloat(bookingAmount);
      const commissionRate = 0.15; // 15%
      const commission = amount * commissionRate;
      const netAmount = amount - commission;
      
      return res.status(200).json(createResponse(true, {
        booking_amount: amount,
        commission_percentage: 15.00,
        commission_amount: commission,
        net_amount: netAmount,
        rule_applied: 'Default Global Commission',
        rule_type: 'global',
      }));
    }

    // Find applicable commission rule (priority order)
    const rulesResult = await query(`
      SELECT * FROM commission_rules 
      WHERE is_active = TRUE
        AND (start_date IS NULL OR start_date <= CURRENT_DATE)
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      ORDER BY 
        CASE WHEN package_id = $1 THEN 30 WHEN supplier_id = $2 THEN 20 WHEN destination_id = $3 THEN 10 ELSE 0 END +
        CASE WHEN category = $4 THEN 5 ELSE 0 END +
        priority DESC
      LIMIT 1
    `, [packageId, supplierId, destinationId, category]);

    let rule = rulesResult.rows[0] as Record<string, unknown> | undefined;

    // Fall back to global if no specific rule found
    if (!rule) {
      const globalResult = await query(`
        SELECT * FROM commission_rules 
        WHERE is_active = TRUE AND commission_type = 'global'
        ORDER BY priority ASC LIMIT 1
      `);
      rule = globalResult.rows[0] as Record<string, unknown> | undefined;
    }

    if (!rule) {
      return res.status(400).json(createResponse(false, undefined, 'No commission rule found'));
    }

    const amount = parseFloat(String(bookingAmount));
    let commission = amount * (parseFloat(String(rule.commission_percentage)) / 100);

    // Apply min/max if set
    if (rule.minimum_commission && commission < parseFloat(String(rule.minimum_commission))) {
      commission = parseFloat(String(rule.minimum_commission));
    }
    if (rule.maximum_commission && commission > parseFloat(String(rule.maximum_commission))) {
      commission = parseFloat(String(rule.maximum_commission));
    }

    res.status(200).json(createResponse(true, {
      booking_amount: amount,
      commission_percentage: parseFloat(String(rule.commission_percentage)),
      commission_amount: commission,
      net_amount: amount - commission,
      rule_applied: rule.name,
      rule_type: rule.commission_type,
      rule_id: rule.id,
    }));
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to calculate commission'));
  }
});

// ==================== SUBSCRIPTION SYSTEM ====================

/**
 * GET /api/monetization/subscriptions/plans - Get all plans
 */
router.get('/subscriptions/plans', async (req: Request, res: Response) => {
  try {
    const { publicOnly } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        plans: [
          {
            id: 'plan_1',
            plan_name: 'Free',
            description: 'Get started with basic listing features',
            price_monthly: 0,
            price_quarterly: 0,
            price_annual: 0,
            features: ['basic_listing', 'inquiry_only', 'basic_analytics'],
            max_packages: 3,
            commission_discount: 0,
            display_order: 1,
          },
          {
            id: 'plan_2',
            plan_name: 'Professional',
            description: 'Perfect for growing safari businesses',
            price_monthly: 49,
            price_quarterly: 129,
            price_annual: 449,
            features: ['full_listing', 'online_bookings', 'advanced_analytics', 'email_support', '5_featured'],
            max_packages: 25,
            commission_discount: 2,
            display_order: 2,
          },
          {
            id: 'plan_3',
            plan_name: 'Premium Partner',
            description: 'For established operators seeking growth',
            price_monthly: 149,
            price_quarterly: 399,
            price_annual: 1399,
            features: ['full_listing', 'online_bookings', 'advanced_analytics', 'priority_support', 'api_access', 'custom_branding', 'unlimited_featured', 'dedicated_manager'],
            max_packages: -1,
            commission_discount: 5,
            display_order: 3,
          },
        ],
      }));
    }

    let sql = 'SELECT * FROM supplier_plans WHERE is_active = TRUE';
    if (publicOnly === 'true') {
      sql += ' AND is_public = TRUE';
    }
    sql += ' ORDER BY display_order ASC';

    const result = await query(sql);
    res.status(200).json(createResponse(true, { plans: result.rows }));
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch plans'));
  }
});

/**
 * GET /api/monetization/subscriptions - Get supplier subscriptions
 */
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const { supplierId, status } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        subscriptions: [
          { id: 'sub_1', supplier_id: 'sup_001', plan_name: 'Professional', status: 'active', price_amount: 49, billing_cycle: 'monthly', expires_at: '2026-08-25T00:00:00Z' },
          { id: 'sub_2', supplier_id: 'sup_002', plan_name: 'Premium Partner', status: 'active', price_amount: 149, billing_cycle: 'monthly', expires_at: '2026-08-25T00:00:00Z' },
          { id: 'sub_3', supplier_id: 'sup_003', plan_name: 'Free', status: 'active', price_amount: 0, billing_cycle: 'monthly', expires_at: null },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM supplier_subscriptions WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (supplierId) {
      sql += ` AND supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { subscriptions: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch subscriptions'));
  }
});

/**
 * POST /api/monetization/subscriptions - Create subscription
 */
router.post('/subscriptions', async (req: Request, res: Response) => {
  try {
    const { supplierId, planId, billingCycle, trialDays } = req.body;

    if (!supplierId || !planId) {
      return res.status(400).json(createResponse(false, undefined, 'Supplier ID and Plan ID required'));
    }

    if (!isDatabaseConnected()) {
      const now = new Date();
      const expiresAt = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return res.status(201).json(createResponse(true, {
        id: `sub_${Date.now()}`,
        supplier_id: supplierId,
        plan_name: 'Professional',
        status: trialDays ? 'trial' : 'active',
        billing_cycle: billingCycle || 'monthly',
        price_amount: 49,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }));
    }

    // Get plan details
    const planResult = await query('SELECT * FROM supplier_plans WHERE id = $1', [planId]);
    if (planResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Plan not found'));
    }

    const plan = planResult.rows[0] as Record<string, unknown>;
    const cycle = billingCycle || 'monthly';
    let price = parseFloat(String(plan.price_monthly));
    if (cycle === 'quarterly') price = parseFloat(String(plan.price_quarterly));
    if (cycle === 'annual') price = parseFloat(String(plan.price_annual));

    const now = new Date();
    let expiresAt = new Date(now);
    if (trialDays) {
      expiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    } else {
      if (cycle === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
      if (cycle === 'quarterly') expiresAt.setMonth(expiresAt.getMonth() + 3);
      if (cycle === 'annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const status = trialDays ? 'trial' : 'active';

    const result = await query(
      `INSERT INTO supplier_subscriptions (
        supplier_id, plan_id, plan_name, status, billing_cycle, price_amount,
        trial_ends_at, starts_at, expires_at, features_snapshot, limits_snapshot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        supplierId, planId, plan.plan_name, status, cycle, price,
        trialDays ? expiresAt : null, now, expiresAt,
        plan.features, JSON.stringify({ max_packages: plan.max_packages })
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Subscription created'));
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create subscription'));
  }
});

// ==================== PROMOTIONS SYSTEM ====================

/**
 * GET /api/monetization/promotions/placements - Get placement options
 */
router.get('/promotions/placements', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        placements: [
          { placement: 'homepage_hero', name: 'Homepage Hero', price_daily: 99, price_weekly: 599, price_monthly: 1999, priority: 100 },
          { placement: 'homepage_featured', name: 'Homepage Featured', price_daily: 49, price_weekly: 299, price_monthly: 999, priority: 80 },
          { placement: 'search_top', name: 'Search Results Top', price_daily: 29, price_weekly: 169, price_monthly: 549, priority: 60 },
          { placement: 'category_featured', name: 'Category Featured', price_daily: 19, price_weekly: 99, price_monthly: 299, priority: 40 },
          { placement: 'destination_featured', name: 'Destination Featured', price_daily: 19, price_weekly: 99, price_monthly: 299, priority: 40 },
          { placement: 'newsletter_featured', name: 'Newsletter Feature', price_daily: 15, price_weekly: 75, price_monthly: 249, priority: 20 },
        ],
      }));
    }

    const result = await query('SELECT * FROM promotion_pricing WHERE is_available = TRUE ORDER BY priority DESC');
    res.status(200).json(createResponse(true, { placements: result.rows }));
  } catch (error) {
    console.error('Error fetching placements:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch placements'));
  }
});

/**
 * GET /api/monetization/promotions - Get promoted listings
 */
router.get('/promotions', async (req: Request, res: Response) => {
  try {
    const { supplierId, placement, active } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        promotions: [
          { id: 'promo_1', supplier_id: 'sup_001', placement: 'homepage_hero', price: 599, payment_status: 'paid', is_active: true, start_date: '2026-07-01', end_date: '2026-07-31', impressions_count: 15420, clicks_count: 892 },
          { id: 'promo_2', supplier_id: 'sup_002', placement: 'search_top', price: 169, payment_status: 'paid', is_active: true, start_date: '2026-07-15', end_date: '2026-07-22', impressions_count: 8320, clicks_count: 456 },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM promoted_listings WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (supplierId) {
      sql += ` AND supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }
    if (placement) {
      sql += ` AND placement = $${paramIndex++}`;
      params.push(placement);
    }
    if (active === 'true') {
      sql += ` AND is_active = TRUE AND end_date >= CURRENT_TIMESTAMP`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { promotions: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch promotions'));
  }
});

/**
 * POST /api/monetization/promotions - Create promotion
 */
router.post('/promotions', async (req: Request, res: Response) => {
  try {
    const { supplierId, packageId, placement, startDate, endDate, price } = req.body;

    if (!supplierId || !placement || !startDate || !endDate) {
      return res.status(400).json(createResponse(false, undefined, 'Supplier ID, placement, start date, and end date required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `promo_${Date.now()}`,
        supplier_id: supplierId,
        placement,
        start_date: startDate,
        end_date: endDate,
        price: price || 99,
        payment_status: 'pending',
        is_active: true,
      }));
    }

    const result = await query(
      `INSERT INTO promoted_listings (supplier_id, package_id, placement, start_date, end_date, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [supplierId, packageId, placement, startDate, endDate, price]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Promotion created'));
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create promotion'));
  }
});

// ==================== REVENUE DASHBOARD ====================

/**
 * GET /api/monetization/revenue/dashboard - Get revenue dashboard
 */
router.get('/revenue/dashboard', async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month', 'year', 'all'

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        summary: {
          total_revenue: 45750.00,
          commission_revenue: 28500.00,
          subscription_revenue: 12450.00,
          promotion_revenue: 4800.00,
          currency: 'USD',
        },
        period_comparison: {
          previous_period: 38200.00,
          change_percentage: 19.8,
        },
        transactions: [
          { type: 'commission', amount: 450.00, date: '2026-07-25', description: 'Booking #book_001' },
          { type: 'subscription', amount: 49.00, date: '2026-07-25', description: 'Professional Plan - sup_001' },
          { type: 'promotion', amount: 299.00, date: '2026-07-24', description: 'Search Top - sup_002' },
        ],
      }));
    }

    let dateFilter = '';
    let params: unknown[] = [];

    switch (period) {
      case 'today':
        dateFilter = 'AND revenue_date = CURRENT_DATE';
        break;
      case 'week':
        dateFilter = 'AND revenue_date >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case 'month':
        dateFilter = 'AND revenue_date >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
      case 'year':
        dateFilter = 'AND revenue_date >= CURRENT_DATE - INTERVAL \'365 days\'';
        break;
    }

    // Get revenue by type
    const revenueResult = await query(`
      SELECT 
        revenue_type,
        SUM(net_amount) as total
      FROM revenue
      WHERE 1=1 ${dateFilter}
      GROUP BY revenue_type
    `, params);

    // Get recent transactions
    const transactionsResult = await query(`
      SELECT 
        revenue_type as type,
        net_amount as amount,
        revenue_date as date,
        description
      FROM revenue
      WHERE 1=1 ${dateFilter}
      ORDER BY created_at DESC
      LIMIT 20
    `, params);

    const revenueByType: Record<string, number> = {
      commission: 0,
      subscription: 0,
      promotion: 0,
      other: 0,
    };

    for (const row of revenueResult.rows as Array<Record<string, unknown>>) {
      revenueByType[row.revenue_type as string] = parseFloat(String(row.total)) || 0;
    }

    const totalRevenue = Object.values(revenueByType).reduce((a, b) => a + b, 0);

    res.status(200).json(createResponse(true, {
      summary: {
        total_revenue: totalRevenue,
        commission_revenue: revenueByType.commission,
        subscription_revenue: revenueByType.subscription,
        promotion_revenue: revenueByType.promotion,
        currency: 'USD',
      },
      transactions: transactionsResult.rows,
    }));
  } catch (error) {
    console.error('Error fetching revenue dashboard:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch revenue dashboard'));
  }
});

/**
 * GET /api/monetization/revenue/analytics - Get revenue analytics
 */
router.get('/revenue/analytics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        daily_revenue: [
          { date: '2026-07-20', commission: 1250, subscription: 450, promotion: 200 },
          { date: '2026-07-21', commission: 1500, subscription: 490, promotion: 0 },
          { date: '2026-07-22', commission: 980, subscription: 490, promotion: 299 },
          { date: '2026-07-23', commission: 2100, subscription: 490, promotion: 150 },
          { date: '2026-07-24', commission: 1750, subscription: 490, promotion: 199 },
          { date: '2026-07-25', commission: 1580, subscription: 490, promotion: 350 },
        ],
        top_suppliers: [
          { supplier_id: 'sup_001', total_revenue: 8500, bookings: 23 },
          { supplier_id: 'sup_002', total_revenue: 6200, bookings: 18 },
          { supplier_id: 'sup_003', total_revenue: 4800, bookings: 12 },
        ],
        metrics: {
          avg_commission_rate: 15.2,
          avg_booking_value: 1250,
          subscription_mrr: 4150,
          promotion_arp: 125,
        },
      }));
    }

    res.status(200).json(createResponse(true, {
      daily_revenue: [],
      top_suppliers: [],
      metrics: {
        avg_commission_rate: 15.0,
        avg_booking_value: 0,
        subscription_mrr: 0,
        promotion_arp: 0,
      },
    }));
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch revenue analytics'));
  }
});

/**
 * GET /api/monetization/revenue/breakdown - Get detailed revenue breakdown
 */
router.get('/revenue/breakdown', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        commission: {
          total: 28500.00,
          bookings_count: 190,
          avg_commission: 150.00,
          by_destination: [
            { destination: 'Serengeti', amount: 8500, percentage: 29.8 },
            { destination: 'Masai Mara', amount: 7200, percentage: 25.3 },
            { destination: 'Kruger', amount: 5500, percentage: 19.3 },
          ],
        },
        subscription: {
          total: 12450.00,
          active_subscriptions: 45,
          by_plan: [
            { plan: 'Professional', count: 32, revenue: 1568 },
            { plan: 'Premium Partner', count: 13, revenue: 1937 },
            { plan: 'Free', count: 156, revenue: 0 },
          ],
          mrr: 4150.00,
        },
        promotion: {
          total: 4800.00,
          active_promotions: 12,
          by_placement: [
            { placement: 'homepage_hero', count: 2, revenue: 1800 },
            { placement: 'search_top', count: 5, revenue: 1200 },
            { placement: 'category_featured', count: 5, revenue: 1800 },
          ],
        },
      }));
    }

    res.status(200).json(createResponse(true, {
      commission: { total: 0, bookings_count: 0, avg_commission: 0, by_destination: [] },
      subscription: { total: 0, active_subscriptions: 0, by_plan: [], mrr: 0 },
      promotion: { total: 0, active_promotions: 0, by_placement: [] },
    }));
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch revenue breakdown'));
  }
});

export default router;
