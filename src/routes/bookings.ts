/**
 * Bookings API Routes
 * Full booking lifecycle management
 */

import { Router, Request, Response } from 'express';
import { query, transaction, isDatabaseConnected } from '../db/index.js';
import type { BookingRow } from '../db/types.js';
import { MOCK_USER_BOOKINGS, MOCK_BOOKING_ADDONS } from '../server/mockData.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

function generateBookingRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IDN-${timestamp}-${random}`;
}

/**
 * GET /api/bookings - List bookings (user's own or all for admin)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, user_id, limit = '50', offset = '0' } = req.query;
    const authHeader = req.headers.authorization;
    
    // In production, extract user_id from JWT token
    // For now, use query param or mock
    
    if (!isDatabaseConnected()) {
      let bookings = [...MOCK_USER_BOOKINGS];
      
      if (status) {
        bookings = bookings.filter(b => b.status === status);
      }
      
      return res.status(200).json(createResponse(true, {
        bookings,
        total: bookings.length,
      }));
    }

    let sql = 'SELECT b.*, d.name as destination_name FROM bookings b LEFT JOIN destinations d ON b.destination_id = d.id WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (user_id) {
      sql += ` AND b.user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (status) {
      sql += ` AND b.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY b.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      bookings: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch bookings', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/bookings/:id - Get single booking
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const booking = MOCK_USER_BOOKINGS.find(b => b.id === id);
      if (!booking) {
        return res.status(404).json(createResponse(false, undefined, 'Not found', 'Booking not found'));
      }
      return res.status(200).json(createResponse(true, booking));
    }

    const result = await query<BookingRow>('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Booking not found'));
    }

    const booking = result.rows[0];

    // Get associated addons
    const addonsResult = await query(
      `SELECT ba.*, addon.name as addon_name, addon.description as addon_description
       FROM booking_selected_addons ba
       JOIN booking_addons addon ON ba.addon_id = addon.id
       WHERE ba.booking_id = $1`,
      [id]
    );

    // Get payment transactions
    const paymentsResult = await query(
      'SELECT * FROM payment_transactions WHERE booking_id = $1 ORDER BY created_at',
      [id]
    );

    res.status(200).json(createResponse(true, {
      ...booking,
      addons: addonsResult.rows,
      payments: paymentsResult.rows,
    }));
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch booking', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/bookings - Create new booking
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      destination_id,
      itinerary_id,
      traveler_name,
      traveler_email,
      traveler_phone,
      start_date,
      end_date,
      adults_count,
      children_count,
      total_price_usd,
      currency,
      selected_addons,
    } = req.body;

    // Validate required fields
    if (!traveler_name || !traveler_email || !start_date || !end_date || !adults_count || !total_price_usd) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields', 'Please provide all required booking information'));
    }

    // Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid dates', 'End date must be after start date'));
    }

    if (!isDatabaseConnected()) {
      // Mock booking creation
      const mockBooking = {
        id: uuidv4(),
        booking_ref: generateBookingRef(),
        status: 'Pending',
        payment_status: 'Unpaid',
        ...req.body,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockBooking));
    }

    // Create booking in transaction
    const booking = await transaction(async (client) => {
      const bookingRef = generateBookingRef();
      
      const result = await client.query(
        `INSERT INTO bookings 
         (booking_ref, user_id, destination_id, itinerary_id, traveler_name, traveler_email, traveler_phone, start_date, end_date, adults_count, children_count, total_price_usd, currency, status, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending', 'Unpaid')
         RETURNING *`,
        [bookingRef, user_id, destination_id, itinerary_id, traveler_name, traveler_email, traveler_phone, start_date, end_date, adults_count, children_count || 0, total_price_usd, currency || 'USD']
      );

      // Add selected addons
      if (selected_addons && selected_addons.length > 0) {
        for (const addon of selected_addons) {
          await client.query(
            'INSERT INTO booking_selected_addons (booking_id, addon_id, quantity, price_at_booking) VALUES ($1, $2, $3, $4)',
            [result.rows[0].id, addon.id, addon.quantity || 1, addon.price]
          );
        }
      }

      return result.rows[0];
    });

    res.status(201).json(createResponse(true, booking, 'Booking created successfully', 'Please proceed with payment'));
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create booking', 'An unexpected error occurred'));
  }
});

/**
 * PUT /api/bookings/:id/status - Update booking status
 */
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Refund Requested'];
    const validPaymentStatuses = ['Unpaid', 'Deposit Paid', 'Paid in Full', 'Refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid status', `Status must be one of: ${validStatuses.join(', ')}`));
    }

    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid payment status', `Payment status must be one of: ${validPaymentStatuses.join(', ')}`));
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (payment_status) {
      updates.push(`payment_status = $${paramIndex++}`);
      values.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'No status to update'));
    }

    values.push(id);
    const result = await query(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Booking not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update booking status', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/bookings/:id/cancel - Cancel booking
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const result = await query(
      `UPDATE bookings SET status = 'Cancelled' WHERE id = $1 AND status IN ('Pending', 'Confirmed') RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Cannot cancel', 'Booking cannot be cancelled or not found'));
    }

    // Log cancellation
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value) VALUES ($1, $2, $3, $4, $5)',
      [null, 'booking_cancelled', 'booking', id, JSON.stringify({ reason })]
    );

    res.status(200).json(createResponse(true, result.rows[0], 'Booking cancelled', 'Your booking has been cancelled'));
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to cancel booking', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/bookings/addons - Get available addons
 */
router.get('/addons/list', async (_req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, MOCK_BOOKING_ADDONS));
    }

    const result = await query('SELECT * FROM booking_addons WHERE is_active = true ORDER BY category, name');
    res.status(200).json(createResponse(true, result.rows));
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch addons', 'An unexpected error occurred'));
  }
});

export default router;
