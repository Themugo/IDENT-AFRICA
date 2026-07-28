/**
 * Users API Routes
 * User management with secure password handling
 */

import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { query, isDatabaseConnected } from '../db/index.js';
import type { UserRow } from '../db/types.js';
import bcrypt from 'bcrypt';

interface UserWithPassword extends UserRow {
  password_hash: string;
}

const router = Router();

const SALT_ROUNDS = 12;

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET /api/users - List users (admin only)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    let sql = 'SELECT id, email, name, role, phone, avatar_url, preferred_currency, email_verified, is_active, created_at, last_login_at FROM users WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      users: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch users', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/users/:id - Get user profile
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query(
      'SELECT id, email, name, role, phone, avatar_url, preferred_currency, dietary_preferences, passport_country, email_verified, is_active, created_at, last_login_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'User not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch user', 'An unexpected error occurred'));
  }
});

/**
 * PUT /api/users/:id - Update user profile
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, avatar_url, preferred_currency, dietary_preferences, passport_country } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = ['name', 'phone', 'avatar_url', 'preferred_currency', 'dietary_preferences', 'passport_country'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(req.body[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'No valid fields to update'));
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role, phone, avatar_url, preferred_currency, email_verified, is_active`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'User not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update user', 'An unexpected error occurred'));
  }
});

/**
 * PUT /api/users/:id/password - Change password
 */
router.put('/:id/password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid password', 'Password must be at least 8 characters'));
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    // Get current user with password hash
    const userResult = await query<UserWithPassword>('SELECT id, password_hash FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'User not found'));
    }

    const user = userResult.rows[0];

    // Verify current password if provided (skip for password reset flows)
    if (current_password && user.password_hash) {
      const isValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isValid) {
        return res.status(401).json(createResponse(false, undefined, 'Invalid password', 'Current password is incorrect'));
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(new_password, SALT_ROUNDS);

    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

    // Log password change
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [id, 'password_changed', 'user', id]
    );

    res.status(200).json(createResponse(true, { message: 'Password updated successfully' }));
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update password', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/users/forgot-password - Request password reset
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(createResponse(false, undefined, 'Email required', 'Please provide your email address'));
    }

    if (!isDatabaseConnected()) {
      // In production, send email with reset link
      return res.status(200).json(createResponse(true, { message: 'If an account exists with this email, a reset link has been sent' }));
    }

    // Check if user exists
    const userResult = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (userResult.rows.length === 0) {
      // Don't reveal if user exists
      return res.status(200).json(createResponse(true, { message: 'If an account exists with this email, a reset link has been sent' }));
    }

    const userId = userResult.rows[0].id;

    // Generate reset token (in production, save to password_resets table and send email)
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, resetToken, expiresAt]
    );

    // In production, send email with reset link
    // const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    res.status(200).json(createResponse(true, { message: 'If an account exists with this email, a reset link has been sent' }));
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json(createResponse(false, undefined, 'Request failed', 'An unexpected error occurred'));
  }
});

/**
 * DELETE /api/users/:id - Deactivate user (soft delete)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'User not found'));
    }

    res.status(200).json(createResponse(true, { id, deactivated: true }));
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to deactivate user', 'An unexpected error occurred'));
  }
});

export default router;
