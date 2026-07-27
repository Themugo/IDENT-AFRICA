/**
 * Admin Supplier Management API Routes
 * 
 * Admin-only endpoints for supplier management.
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';

const router = Router();

function createResponse<T>(data: T, error?: string) {
  return {
    success: !error,
    data,
    ...(error ? { error } : {}),
    timestamp: new Date().toISOString(),
  };
}

// Mock data
const MOCK_APPLICATIONS = [
  { id: '1', companyName: 'Acacia Adventure Activities', type: 'activity_provider', submittedAt: '2025-07-20', documents: 3 },
  { id: '2', companyName: 'Serengeti Stars Lodge', type: 'lodge', submittedAt: '2025-07-18', documents: 4 },
];

const MOCK_SUPPLIERS = [
  { id: '1', companyName: 'Mara Serena Safari Lodge', type: 'lodge', status: 'approved', country: 'Kenya', products: 12, bookings: 156, revenue: 234000, rating: 4.8 },
  { id: '2', companyName: 'WildAfrica Tours', type: 'safari_operator', status: 'approved', country: 'Kenya', products: 8, bookings: 234, revenue: 456000, rating: 4.9 },
  { id: '3', companyName: 'Gorilla Guardians Uganda', type: 'tour_guide', status: 'approved', country: 'Uganda', products: 6, bookings: 89, revenue: 178000, rating: 4.7 },
  { id: '4', companyName: 'Zanzibar Pearl Hotel', type: 'hotel', status: 'approved', country: 'Tanzania', products: 15, bookings: 201, revenue: 312000, rating: 4.6 },
  { id: '5', companyName: 'Savanna Transport Co', type: 'transport_company', status: 'approved', country: 'Kenya', products: 5, bookings: 312, revenue: 89000, rating: 4.5 },
];

// ============ LIST ALL SUPPLIERS ============

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, search, limit = 20, offset = 0 } = req.query;

    interface SupplierRow {
      id: string;
      company_name: string;
      supplier_type: string;
      status: string;
      country: string;
      city: string;
      contact_email: string;
      total_products: string;
      total_bookings: string;
      total_revenue: string;
      average_rating: string;
      verification_status: string;
      created_at: string;
    }

    if (!isDatabaseConnected()) {
      let filtered = MOCK_SUPPLIERS;
      if (status) filtered = filtered.filter(s => s.status === status);
      if (type) filtered = filtered.filter(s => s.type === type);
      if (search) filtered = filtered.filter(s => s.companyName.toLowerCase().includes(search.toString().toLowerCase()));
      return res.status(200).json(createResponse({ items: filtered, total: filtered.length }));
    }

    let sql = `
      SELECT id, company_name, supplier_type, status, country, city, 
             contact_email, total_products, total_bookings, total_revenue,
             average_rating, verification_status, created_at
      FROM suppliers WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (type) {
      sql += ` AND supplier_type = $${paramIndex++}`;
      params.push(type);
    }

    if (search) {
      sql += ` AND company_name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query<SupplierRow>(sql, params);

    const items = result.rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      type: row.supplier_type,
      status: row.status,
      country: row.country,
      city: row.city,
      email: row.contact_email,
      products: parseInt(row.total_products || '0'),
      bookings: parseInt(row.total_bookings || '0'),
      revenue: parseFloat(row.total_revenue || '0'),
      rating: parseFloat(row.average_rating || '0'),
      verificationStatus: row.verification_status,
      memberSince: row.created_at,
    }));

    res.status(200).json(createResponse({ items, total: items.length }));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch suppliers'));
  }
});

// ============ GET SUPPLIER DETAILS ============

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    interface SupplierRow {
      id: string;
      company_name: string;
      supplier_type: string;
      description: string;
      tagline: string;
      logo_url: string;
      cover_image_url: string;
      city: string;
      country: string;
      contact_email: string;
      contact_phone: string;
      website: string;
      business_registration_number: string;
      status: string;
      verification_status: string;
      commission_rate: string;
      total_products: string;
      total_bookings: string;
      total_revenue: string;
      average_rating: string;
      total_reviews: string;
      created_at: string;
      verified_at: string;
    }

    if (!isDatabaseConnected()) {
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      if (!supplier) return res.status(404).json(createResponse(undefined, 'Supplier not found'));
      return res.status(200).json(createResponse({ ...supplier, email: 'contact@supplier.com', phone: '+254700000000' }));
    }

    const result = await query<SupplierRow>('SELECT * FROM suppliers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Supplier not found'));
    }

    const row = result.rows[0];
    res.status(200).json(createResponse({
      id: row.id,
      companyName: row.company_name,
      type: row.supplier_type,
      description: row.description,
      tagline: row.tagline,
      logo: row.logo_url,
      coverImage: row.cover_image_url,
      city: row.city,
      country: row.country,
      email: row.contact_email,
      phone: row.contact_phone,
      website: row.website,
      businessRegNumber: row.business_registration_number,
      status: row.status,
      verificationStatus: row.verification_status,
      commissionRate: parseFloat(row.commission_rate || '15'),
      products: parseInt(row.total_products || '0'),
      bookings: parseInt(row.total_bookings || '0'),
      revenue: parseFloat(row.total_revenue || '0'),
      rating: parseFloat(row.average_rating || '0'),
      reviews: parseInt(row.total_reviews || '0'),
      memberSince: row.created_at,
      verifiedAt: row.verified_at,
    }));
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch supplier'));
  }
});

// ============ APPROVE SUPPLIER ============

router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ message: 'Supplier approved (mock)', status: 'approved' }));
    }

    let sql = 'UPDATE suppliers SET status = $1, updated_at = NOW()';
    const params: any[] = ['approved'];
    let paramIndex = 2;

    if (commissionRate) {
      sql += `, commission_rate = $${paramIndex++}`;
      params.push(commissionRate);
    }

    sql += ` WHERE id = $${paramIndex}`;
    params.push(id);

    await query(sql, params);

    res.status(200).json(createResponse({ message: 'Supplier approved', status: 'approved' }));
  } catch (error) {
    console.error('Error approving supplier:', error);
    res.status(500).json(createResponse(undefined, 'Failed to approve supplier'));
  }
});

// ============ REJECT SUPPLIER ============

router.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ message: 'Supplier rejected (mock)', status: 'rejected' }));
    }

    await query(
      'UPDATE suppliers SET status = $1, verification_notes = $2, updated_at = NOW() WHERE id = $3',
      ['rejected', reason || 'Application does not meet requirements', id]
    );

    res.status(200).json(createResponse({ message: 'Supplier rejected', status: 'rejected' }));
  } catch (error) {
    console.error('Error rejecting supplier:', error);
    res.status(500).json(createResponse(undefined, 'Failed to reject supplier'));
  }
});

// ============ SUSPEND SUPPLIER ============

router.patch('/:id/suspend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ message: 'Supplier suspended (mock)', status: 'suspended' }));
    }

    await query(
      'UPDATE suppliers SET status = $1, updated_at = NOW() WHERE id = $2',
      ['suspended', id]
    );

    res.status(200).json(createResponse({ message: 'Supplier suspended', status: 'suspended' }));
  } catch (error) {
    console.error('Error suspending supplier:', error);
    res.status(500).json(createResponse(undefined, 'Failed to suspend supplier'));
  }
});

// ============ GET PENDING APPLICATIONS ============

router.get('/applications/pending', async (req: Request, res: Response) => {
  try {
    interface ApplicationRow {
      id: string;
      company_name: string;
      supplier_type: string;
      contact_email: string;
      verification_status: string;
      created_at: string;
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ items: MOCK_APPLICATIONS, total: MOCK_APPLICATIONS.length }));
    }

    const result = await query<ApplicationRow>(`
      SELECT id, company_name, supplier_type, contact_email, verification_status, created_at
      FROM suppliers
      WHERE status = 'pending' OR verification_status IN ('documents_submitted', 'under_review')
      ORDER BY created_at DESC
    `);

    const items = result.rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      type: row.supplier_type,
      email: row.contact_email,
      verificationStatus: row.verification_status,
      submittedAt: row.created_at,
    }));

    res.status(200).json(createResponse({ items, total: items.length }));
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch applications'));
  }
});

// ============ GET SUPPLIER STATS ============

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({
        total: 5,
        pending: 2,
        approved: 4,
        suspended: 1,
        totalRevenue: 1259000,
        totalBookings: 992,
      }));
    }

    interface StatsRow {
      status: string;
      count: string;
    }

    const result = await query<StatsRow>(`
      SELECT status, COUNT(*) as count FROM suppliers GROUP BY status
    `);

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      suspended: 0,
      totalRevenue: 0,
      totalBookings: 0,
    };

    result.rows.forEach(row => {
      const count = parseInt(row.count);
      stats.total += count;
      if (row.status === 'pending') stats.pending = count;
      if (row.status === 'approved') stats.approved = count;
      if (row.status === 'suspended') stats.suspended = count;
    });

    const revenueResult = await query<{ total: string }>('SELECT COALESCE(SUM(total_revenue), 0) as total FROM suppliers');
    const bookingsResult = await query<{ total: string }>('SELECT COALESCE(SUM(total_bookings), 0) as total FROM suppliers');

    stats.totalRevenue = parseFloat(revenueResult.rows[0]?.total || '0');
    stats.totalBookings = parseInt(bookingsResult.rows[0]?.total || '0');

    res.status(200).json(createResponse(stats));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch stats'));
  }
});

export default router;
