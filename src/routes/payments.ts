/**
 * Payments API Routes
 * Payment processing with transaction tracking
 */

import { Router, Request, Response } from 'express';
import { query, transaction, isDatabaseConnected } from '../db/index.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

function generateTransactionRef(gateway: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${gateway.toUpperCase()}-${timestamp}-${random}`;
}

/**
 * POST /api/payments/create - Create payment record
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { booking_id, amount, currency, gateway, customer_email, customer_phone } = req.body;

    if (!booking_id || !amount || !gateway) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields', 'booking_id, amount, and gateway are required'));
    }

    if (!isDatabaseConnected()) {
      // Mock payment creation
      const mockPayment = {
        id: require('crypto').randomUUID(),
        transaction_ref: generateTransactionRef(gateway),
        booking_id,
        amount,
        currency: currency || 'USD',
        gateway,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockPayment));
    }

    const transactionRef = generateTransactionRef(gateway);

    const result = await query(
      `INSERT INTO payment_transactions 
       (transaction_ref, booking_id, amount, currency, gateway, customer_email, customer_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [transactionRef, booking_id, amount, currency || 'USD', gateway, customer_email, customer_phone]
    );

    // Update booking payment status
    await query(
      'UPDATE bookings SET payment_status = $1 WHERE id = $2',
      ['Deposit Paid', booking_id]
    );

    res.status(201).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create payment', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/payments/:id - Get payment status
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query('SELECT * FROM payment_transactions WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Payment not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch payment', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/payments/:id/confirm - Confirm payment completion
 */
router.post('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { gateway_transaction_id, gateway_response } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await transaction(async (client) => {
      // Update payment status
      const paymentResult = await client.query(
        `UPDATE payment_transactions 
         SET status = 'completed', gateway_transaction_id = $1, gateway_response = $2
         WHERE id = $3 AND status = 'pending'
         RETURNING *`,
        [gateway_transaction_id, JSON.stringify(gateway_response || {}), id]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('Payment not found or already processed');
      }

      // Update booking payment status
      await client.query(
        'UPDATE bookings SET payment_status = $1 WHERE id = $2',
        ['Paid in Full', paymentResult.rows[0].booking_id]
      );

      // Log payment confirmation
      await client.query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, new_value) VALUES ($1, $2, $3, $4)',
        ['payment_confirmed', 'payment_transaction', id, JSON.stringify({ gateway_transaction_id })]
      );

      return paymentResult.rows[0];
    });

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to confirm payment', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/payments/:id/fail - Mark payment as failed
 */
router.post('/:id/fail', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { gateway_response, reason } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query(
      `UPDATE payment_transactions 
       SET status = 'failed', gateway_response = $1
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [JSON.stringify({ reason, ...gateway_response }), id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Payment not found or already processed'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error marking payment as failed:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update payment status', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/payments/:id/refund - Process refund
 */
router.post('/:id/refund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await transaction(async (client) => {
      // Get original payment
      const originalPayment = await client.query(
        'SELECT * FROM payment_transactions WHERE id = $1 AND status = $2',
        [id, 'completed']
      );

      if (originalPayment.rows.length === 0) {
        throw new Error('Payment not found or not eligible for refund');
      }

      const refundAmount = amount || originalPayment.rows[0].amount;
      
      if (refundAmount > Number(originalPayment.rows[0].amount)) {
        throw new Error('Refund amount exceeds original payment');
      }

      // Create refund record
      const refundRef = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const refundResult = await client.query(
        `INSERT INTO payment_transactions 
         (transaction_ref, booking_id, amount, currency, gateway, status, gateway_response, customer_email, customer_phone, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          refundRef,
          originalPayment.rows[0].booking_id,
          -refundAmount, // Negative for refund
          originalPayment.rows[0].currency,
          originalPayment.rows[0].gateway,
          'refunded',
          JSON.stringify({ original_transaction_id: id, reason }),
          originalPayment.rows[0].customer_email,
          originalPayment.rows[0].customer_phone,
          JSON.stringify({ is_refund: true, original_amount: originalPayment.rows[0].amount })
        ]
      );

      // Update booking status if full refund
      if (refundAmount >= Number(originalPayment.rows[0].amount)) {
        await client.query(
          'UPDATE bookings SET payment_status = $1 WHERE id = $2',
          ['Refunded', originalPayment.rows[0].booking_id]
        );
      }

      // Log refund
      await client.query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, new_value) VALUES ($1, $2, $3, $4)',
        ['payment_refunded', 'payment_transaction', id, JSON.stringify({ refund_amount: refundAmount, reason })]
      );

      return refundResult.rows[0];
    });

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    console.error('Error processing refund:', error);
    const message = error instanceof Error ? error.message : 'Failed to process refund';
    res.status(500).json(createResponse(false, undefined, 'Refund failed', message));
  }
});

/**
 * GET /api/payments/booking/:bookingId - Get payments for booking
 */
router.get('/booking/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query(
      'SELECT * FROM payment_transactions WHERE booking_id = $1 ORDER BY created_at DESC',
      [bookingId]
    );

    res.status(200).json(createResponse(true, {
      payments: result.rows,
      total: result.rows.length,
    }));
  } catch (error) {
    console.error('Error fetching booking payments:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch payments', 'An unexpected error occurred'));
  }
});

export default router;
