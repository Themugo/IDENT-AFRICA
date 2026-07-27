/**
 * Suppliers API Routes
 * Supplier management and approval workflow
 */

import { Router, Request, Response } from 'express';
import { query, transaction, isDatabaseConnected } from '../db/index.js';
import type { SupplierRow } from '../db/types.js';

interface SupplierStatsResult {
  approval_status: string;
  count: string;
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
 * GET /api/suppliers - List suppliers
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, country, search, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        suppliers: [],
        total: 0,
      }));
    }

    let sql = 'SELECT * FROM suppliers WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND approval_status = $${paramIndex++}`;
      params.push(status);
    }
    if (type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (country) {
      sql += ` AND country = $${paramIndex++}`;
      params.push(country);
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      suppliers: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch suppliers', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/suppliers/:id - Get supplier details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query('SELECT * FROM suppliers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Supplier not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch supplier', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/suppliers/apply - Submit supplier application
 */
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const { id, name, type, email, phone, country, region } = req.body;

    // Validate required fields
    if (!name || !type || !email || !phone || !country || !region) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields', 'Please provide all required information'));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid email', 'Please provide a valid email address'));
    }

    if (!isDatabaseConnected()) {
      const mockSupplier = {
        id: id || `supplier-${Date.now()}`,
        name,
        type,
        email,
        phone,
        country,
        region,
        approval_status: 'pending_approval',
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockSupplier, 'Application submitted', 'Your application is being reviewed'));
    }

    // Check if email already exists
    const existingResult = await query('SELECT id FROM suppliers WHERE email = $1', [email.toLowerCase()]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json(createResponse(false, undefined, 'Email already registered', 'A supplier with this email already exists'));
    }

    const result = await query<SupplierRow>(
      `INSERT INTO suppliers (id, name, type, email, phone, country, region, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_approval')
       RETURNING *`,
      [id, name, type, email.toLowerCase(), phone, country, region]
    );

    const supplier = result.rows[0];

    // Log application
    await query(
      'INSERT INTO audit_logs (entity_type, entity_id, action, new_value) VALUES ($1, $2, $3, $4)',
      ['supplier', supplier.id, 'supplier_application_submitted', JSON.stringify({ type, country })]
    );

    res.status(201).json(createResponse(true, supplier, 'Application submitted', 'Your application is being reviewed. We will contact you within 48 hours.'));
  } catch (error) {
    console.error('Error submitting supplier application:', error);
    res.status(500).json(createResponse(false, undefined, 'Application failed', 'An unexpected error occurred'));
  }
});

/**
 * PUT /api/suppliers/:id/approve - Approve supplier
 */
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await transaction(async (client) => {
      const updateResult = await client.query(
        `UPDATE suppliers SET approval_status = 'approved' WHERE id = $1 AND approval_status = 'pending_approval' RETURNING *`,
        [id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Supplier not found or already processed');
      }

      // Log approval
      await client.query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, new_value) VALUES ($1, $2, $3, $4)',
        ['supplier_approved', 'supplier', id, JSON.stringify({ status: 'approved' })]
      );

      return updateResult.rows[0];
    });

    res.status(200).json(createResponse(true, result, 'Supplier approved', 'Supplier has been approved and notified'));
  } catch (error) {
    console.error('Error approving supplier:', error);
    const message = error instanceof Error ? error.message : 'Failed to approve supplier';
    res.status(500).json(createResponse(false, undefined, 'Approval failed', message));
  }
});

/**
 * PUT /api/suppliers/:id/reject - Reject supplier
 */
router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await transaction(async (client) => {
      const updateResult = await client.query(
        `UPDATE suppliers SET approval_status = 'rejected' WHERE id = $1 AND approval_status = 'pending_approval' RETURNING *`,
        [id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Supplier not found or already processed');
      }

      // Log rejection
      await client.query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, new_value) VALUES ($1, $2, $3, $4)',
        ['supplier_rejected', 'supplier', id, JSON.stringify({ status: 'rejected', reason })]
      );

      return updateResult.rows[0];
    });

    res.status(200).json(createResponse(true, result, 'Supplier rejected', 'Supplier has been notified of the decision'));
  } catch (error) {
    console.error('Error rejecting supplier:', error);
    const message = error instanceof Error ? error.message : 'Failed to reject supplier';
    res.status(500).json(createResponse(false, undefined, 'Rejection failed', message));
  }
});

/**
 * PUT /api/suppliers/:id/revisions - Request revisions
 */
router.put('/:id/revisions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json(createResponse(false, undefined, 'Feedback required', 'Please provide feedback for revisions'));
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await transaction(async (client) => {
      const updateResult = await client.query(
        `UPDATE suppliers SET approval_status = 'revisions_requested' WHERE id = $1 RETURNING *`,
        [id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Supplier not found');
      }

      // Log revisions request
      await client.query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, new_value) VALUES ($1, $2, $3, $4)',
        ['supplier_revisions_requested', 'supplier', id, JSON.stringify({ feedback })]
      );

      return updateResult.rows[0];
    });

    res.status(200).json(createResponse(true, result, 'Revisions requested', 'Supplier has been notified of required changes'));
  } catch (error) {
    console.error('Error requesting revisions:', error);
    res.status(500).json(createResponse(false, undefined, 'Request failed', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/suppliers/stats/overview - Get supplier statistics
 */
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        pending: 0,
        approved: 0,
        rejected: 0,
        revisions_requested: 0,
        total: 0,
      }));
    }

    const result = await query<SupplierStatsResult>(
      `SELECT approval_status, COUNT(*) as count FROM suppliers GROUP BY approval_status`
    );

    const stats = {
      pending_approval: 0,
      approved: 0,
      rejected: 0,
      revisions_requested: 0,
      total: 0,
    };

    for (const row of result.rows) {
      const status = row.approval_status;
      const count = parseInt(row.count || '0') || 0;
      if (status in stats) {
        (stats as Record<string, number>)[status] = count;
      }
      stats.total += count;
    }

    res.status(200).json(createResponse(true, stats));
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics', 'An unexpected error occurred'));
  }
});

export default router;
