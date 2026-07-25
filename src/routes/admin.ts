/**
 * Admin API Routes
 * CMS functionality and dashboard statistics
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';
import type { MonthlyStatsRow } from '../db/types.js';
import { MOCK_ADMIN_STATS } from '../server/mockData.js';

interface StatsResult {
  count?: string;
  revenue?: string;
  total?: string;
}

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET /api/admin/stats - Dashboard statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, MOCK_ADMIN_STATS));
    }

    // Get real statistics from database
    const [
      usersResult,
      bookingsResult,
      destinationsResult,
      suppliersResult,
      revenueResult,
    ] = await Promise.all([
      query<StatsResult>('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      query<StatsResult>('SELECT COUNT(*) as count, SUM(total_price_usd) as revenue FROM bookings WHERE status != $1', ['Cancelled']),
      query<StatsResult>('SELECT COUNT(*) as count FROM destinations WHERE is_active = true'),
      query<StatsResult>('SELECT COUNT(*) as count FROM suppliers WHERE approval_status = $1', ['pending_approval']),
      query<StatsResult>('SELECT SUM(amount) as total FROM payment_transactions WHERE status = $1', ['completed']),
    ]);

    const stats = {
      totalUsers: parseInt(usersResult.rows[0]?.count || '0') || 0,
      totalBookings: parseInt(bookingsResult.rows[0]?.count || '0') || 0,
      totalRevenueUSD: parseFloat(bookingsResult.rows[0]?.revenue || '0') || 0,
      activeDestinations: parseInt(destinationsResult.rows[0]?.count || '0') || 0,
      pendingSuppliers: parseInt(suppliersResult.rows[0]?.count || '0') || 0,
      totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0') || 0,
      monthlyBookings: await getMonthlyBookings(),
      topDestinations: await getTopDestinations(),
      recentBookings: await getRecentBookings(),
    };

    res.status(200).json(createResponse(true, stats));
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/admin/stats/monthly - Monthly booking statistics
 */
router.get('/stats/monthly', async (req: Request, res: Response) => {
  try {
    const monthlyData = await getMonthlyBookings();
    res.status(200).json(createResponse(true, monthlyData));
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch monthly statistics'));
  }
});

/**
 * GET /api/admin/audit-logs - Audit log entries
 */
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { action, entity_type, limit = '100', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { logs: [], total: 0 }));
    }

    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (action) {
      sql += ` AND action = $${paramIndex++}`;
      params.push(action);
    }
    if (entity_type) {
      sql += ` AND entity_type = $${paramIndex++}`;
      params.push(entity_type);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      logs: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch audit logs'));
  }
});

/**
 * GET /api/admin/activity - Recent activity feed
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { activities: [] }));
    }

    // Get recent activity from audit logs and bookings
    const result = await query(
      `SELECT 'audit' as type, action as activity_type, entity_type, entity_id, created_at, new_value
       FROM audit_logs
       UNION ALL
       SELECT 'booking' as type, CONCAT('booking_', LOWER(status)) as activity_type, 'booking' as entity_type, id as entity_id, created_at, NULL
       FROM bookings
       ORDER BY created_at DESC
       LIMIT $1`,
      [Number(limit)]
    );

    res.status(200).json(createResponse(true, {
      activities: result.rows,
    }));
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch activity'));
  }
});

/**
 * POST /api/admin/seed - Seed initial data (development only)
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const { confirm } = req.body;

    if (confirm !== 'SEED_DATA') {
      return res.status(400).json(createResponse(false, undefined, 'Confirmation required', 'Set confirm to "SEED_DATA" to proceed'));
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json(createResponse(false, undefined, 'Forbidden', 'Cannot seed data in production'));
    }

    // Seed booking addons
    const addons = [
      { name: 'Airport Transfer', description: 'Round-trip airport transfers', price: 150, category: 'Transport', price_type: 'per_booking' },
      { name: 'Travel Insurance', description: 'Comprehensive travel insurance', price: 45, category: 'Insurance', price_type: 'per_person' },
      { name: 'Photography Safari', description: 'Professional wildlife photography guide', price: 200, category: 'Experience', price_type: 'per_day' },
      { name: 'Bush Dinner', description: 'Romantic dinner in the bush', price: 120, category: 'Meal', price_type: 'per_person' },
      { name: 'Hot Air Balloon', description: ' sunrise hot air balloon ride', price: 450, category: 'Experience', price_type: 'per_person' },
      { name: 'Park Fees Package', description: 'All park entry fees included', price: 300, category: 'Other', price_type: 'per_person' },
    ];

    for (const addon of addons) {
      await query(
        `INSERT INTO booking_addons (name, description, price_usd, category, price_type)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [addon.name, addon.description, addon.price, addon.category, addon.price_type]
      );
    }

    res.status(200).json(createResponse(true, { seeded: true, addons_count: addons.length }));
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to seed data'));
  }
});

// Helper functions
async function getMonthlyBookings() {
  if (!isDatabaseConnected()) {
    return MOCK_ADMIN_STATS.monthlyBookings;
  }

  const result = await query<MonthlyStatsRow>(`
    SELECT 
      TO_CHAR(created_at, 'Mon') as month,
      COUNT(*) as bookings,
      SUM(total_price_usd) as revenue
    FROM bookings
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
    ORDER BY EXTRACT(MONTH FROM created_at)
  `);

  return result.rows.map(row => ({
    month: row.month,
    bookings: parseInt(row.bookings || '0'),
    revenueUSD: parseFloat(row.revenue || '0') || 0,
  }));
}

async function getTopDestinations() {
  if (!isDatabaseConnected()) {
    return [];
  }

  const result = await query(`
    SELECT d.id, d.name, d.country, COUNT(b.id) as booking_count
    FROM destinations d
    LEFT JOIN bookings b ON d.id = b.destination_id
    GROUP BY d.id, d.name, d.country
    ORDER BY booking_count DESC
    LIMIT 10
  `);

  return result.rows;
}

async function getRecentBookings() {
  if (!isDatabaseConnected()) {
    return [];
  }

  const result = await query(`
    SELECT b.*, d.name as destination_name
    FROM bookings b
    LEFT JOIN destinations d ON b.destination_id = d.id
    ORDER BY b.created_at DESC
    LIMIT 10
  `);

  return result.rows;
}

export default router;
