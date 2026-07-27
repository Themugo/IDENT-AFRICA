/**
 * Notifications API Routes
 * Multi-channel notifications: Email, SMS, WhatsApp, Push
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

// ==================== NOTIFICATIONS ====================

/**
 * GET /api/notifications - Get notifications
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, userType, status, type, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        notifications: [],
        total: 0,
        unreadCount: 0,
      }));
    }

    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (userId) {
      sql += ` AND recipient_id = $${paramIndex++}`;
      params.push(userId);
    }
    if (userType) {
      sql += ` AND recipient_type = $${paramIndex++}`;
      params.push(userType);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    // Get unread count
    let unreadCount = 0;
    if (userId) {
      const unreadResult = await query(
        'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND status != $2',
        [userId, 'read']
      );
      unreadCount = parseInt((unreadResult.rows[0] as Record<string, unknown> | undefined)?.count as string || '0');
    }

    res.status(200).json(createResponse(true, {
      notifications: result.rows,
      total: result.rowCount || 0,
      unreadCount,
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch notifications'));
  }
});

/**
 * POST /api/notifications - Send notification
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      recipientId,
      recipientType,
      recipientEmail,
      recipientPhone,
      type,
      channel,
      subject,
      message,
      metadata,
      relatedEntityType,
      relatedEntityId,
    } = req.body;

    if (!recipientId || !type || !channel || !message) {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Missing required fields'
      ));
    }

    if (!isDatabaseConnected()) {
      // Mock notification
      const mockNotification = {
        id: `notif_${Date.now()}`,
        recipient_id: recipientId,
        recipient_type: recipientType || 'customer',
        type,
        channel,
        subject,
        message,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockNotification, 'Notification sent'));
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await query(
      `INSERT INTO notifications (
        id, recipient_id, recipient_type, recipient_email, recipient_phone,
        type, channel, subject, message, metadata,
        related_entity_type, related_entity_id, status, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'sent', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        id, recipientId, recipientType || 'customer', recipientEmail, recipientPhone,
        type, channel, subject, message, JSON.stringify(metadata || {}),
        relatedEntityType, relatedEntityId
      ]
    );

    // Simulate delivery (in production, integrate with actual services)
    await query(
      `UPDATE notifications SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Notification sent'));
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to send notification'));
  }
});

/**
 * PUT /api/notifications/:id/read - Mark as read
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Notification marked as read'));
    }

    const result = await query(
      `UPDATE notifications 
       SET status = 'read', read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Notification not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0], 'Notification marked as read'));
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to mark notification as read'));
  }
});

/**
 * PUT /api/notifications/read-all - Mark all as read
 */
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'All notifications marked as read'));
    }

    await query(
      `UPDATE notifications 
       SET status = 'read', read_at = CURRENT_TIMESTAMP 
       WHERE recipient_id = $1 AND status != 'read'`,
      [userId]
    );

    res.status(200).json(createResponse(true, undefined, 'All notifications marked as read'));
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to mark all as read'));
  }
});

/**
 * DELETE /api/notifications/:id - Delete notification
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Notification deleted'));
    }

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Notification not found'));
    }

    res.status(200).json(createResponse(true, undefined, 'Notification deleted'));
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete notification'));
  }
});

// ==================== MESSAGES ====================

/**
 * GET /api/notifications/messages - Get messages
 */
router.get('/messages', async (req: Request, res: Response) => {
  try {
    const { userId, conversationId, unreadOnly, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        messages: [],
        total: 0,
        conversations: [],
      }));
    }

    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (conversationId) {
      sql += ` AND conversation_id = $${paramIndex++}`;
      params.push(conversationId);
    }

    if (unreadOnly === 'true') {
      sql += ` AND recipient_id = $${paramIndex++} AND is_read = FALSE`;
      params.push(userId);
    } else if (userId) {
      sql += ` AND (sender_id = $${paramIndex} OR recipient_id = $${paramIndex++})`;
      params.push(userId);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    // Get conversations list
    let conversations: unknown[] = [];
    if (userId) {
      const convResult = await query(
        `SELECT DISTINCT conversation_id,
                MAX(created_at) as last_message_at,
                COUNT(*) FILTER (WHERE is_read = FALSE AND recipient_id = $1) as unread_count
         FROM messages
         WHERE sender_id = $1 OR recipient_id = $1
         GROUP BY conversation_id
         ORDER BY last_message_at DESC`,
        [userId]
      );
      conversations = convResult.rows;
    }

    res.status(200).json(createResponse(true, {
      messages: result.rows,
      total: result.rowCount || 0,
      conversations,
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch messages'));
  }
});

/**
 * GET /api/notifications/conversations - Get conversations list
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { userId, userType, limit = '20', offset = '0' } = req.query;

    if (!userId) {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    if (!isDatabaseConnected()) {
      // Mock conversations
      return res.status(200).json(createResponse(true, {
        conversations: [
          { id: 'conv_1', participant: 'Admin Support', lastMessage: 'Your booking is confirmed', unreadCount: 2, updatedAt: new Date().toISOString() },
          { id: 'conv_2', participant: 'Safari Operators Ltd', lastMessage: 'Thank you for choosing us!', unreadCount: 0, updatedAt: new Date().toISOString() },
        ],
      }));
    }

    const result = await query(
      `SELECT DISTINCT ON (m.conversation_id)
        m.conversation_id,
        m.content as last_message,
        m.created_at as updated_at,
        m.sender_id,
        m.sender_name,
        m.sender_type,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.conversation_id = m.conversation_id 
         AND m2.recipient_id = $1 
         AND m2.is_read = FALSE) as unread_count
       FROM messages m
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY m.conversation_id, m.created_at DESC`,
      [userId]
    );

    res.status(200).json(createResponse(true, { conversations: result.rows }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch conversations'));
  }
});

/**
 * POST /api/notifications/messages - Send message
 */
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      senderId,
      senderType,
      senderName,
      recipientId,
      recipientType,
      content,
      messageType = 'text',
      attachments,
      relatedEntityType,
      relatedEntityId,
    } = req.body;

    if (!senderId || !content) {
      return res.status(400).json(createResponse(false, undefined, 'Sender ID and content are required'));
    }

    if (!isDatabaseConnected()) {
      const mockMessage = {
        id: `msg_${Date.now()}`,
        conversation_id: conversationId || `conv_${Date.now()}`,
        sender_id: senderId,
        sender_type: senderType || 'customer',
        sender_name: senderName,
        recipient_id: recipientId,
        content,
        message_type: messageType,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockMessage, 'Message sent'));
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const convId = conversationId || `conv_${senderId}_${recipientId || 'broadcast'}`;

    const result = await query(
      `INSERT INTO messages (
        id, conversation_id, sender_id, sender_type, sender_name,
        recipient_id, recipient_type, content, message_type, attachments,
        related_entity_type, related_entity_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        id, convId, senderId, senderType || 'customer', senderName,
        recipientId, recipientType, content, messageType, JSON.stringify(attachments || []),
        relatedEntityType, relatedEntityId
      ]
    );

    // Create notification for recipient
    if (recipientId) {
      await query(
        `INSERT INTO notifications (
          id, recipient_id, recipient_type, type, channel,
          subject, message, metadata, related_entity_type, related_entity_id,
          status, sent_at
        ) VALUES ($1, $2, $3, 'supplier_message', 'push',
          $4, $5, $6, 'message', $7, 'sent', CURRENT_TIMESTAMP)`,
        [
          `notif_${Date.now()}`,
          recipientId,
          recipientType || 'customer',
          `New message from ${senderName || senderId}`,
          content.substring(0, 100),
          JSON.stringify({ messageId: id, conversationId: convId }),
          id
        ]
      );
    }

    res.status(201).json(createResponse(true, result.rows[0], 'Message sent'));
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to send message'));
  }
});

/**
 * PUT /api/notifications/messages/:id/read - Mark message as read
 */
router.put('/messages/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Message marked as read'));
    }

    const result = await query(
      `UPDATE messages 
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Message not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0], 'Message marked as read'));
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to mark message as read'));
  }
});

/**
 * PUT /api/notifications/messages/conversation/:conversationId/read - Mark all messages in conversation as read
 */
router.put('/messages/conversation/:conversationId/read', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'All messages marked as read'));
    }

    await query(
      `UPDATE messages 
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
       WHERE conversation_id = $1 AND recipient_id = $2 AND is_read = FALSE`,
      [conversationId, userId]
    );

    res.status(200).json(createResponse(true, undefined, 'All messages marked as read'));
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to mark conversation as read'));
  }
});

// ==================== TEMPLATES ====================

/**
 * GET /api/notifications/templates - Get notification templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { type, channel, activeOnly = 'true' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { templates: [] }));
    }

    let sql = 'SELECT * FROM notification_templates WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (channel) {
      sql += ` AND channel = $${paramIndex++}`;
      params.push(channel);
    }
    if (activeOnly === 'true') {
      sql += ' AND is_active = TRUE';
    }

    sql += ' ORDER BY priority DESC, name ASC';

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, { templates: result.rows }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch templates'));
  }
});

/**
 * POST /api/notifications/templates - Create template
 */
router.post('/templates', async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      channel,
      subject,
      templateBody,
      templateVariables,
      priority,
      createdBy,
    } = req.body;

    if (!name || !type || !channel || !templateBody) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    if (!isDatabaseConnected()) {
      const mockTemplate = {
        id: `tpl_${Date.now()}`,
        name,
        type,
        channel,
        subject,
        template_body: templateBody,
        template_variables: templateVariables || [],
        is_active: true,
        priority: priority || 0,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockTemplate, 'Template created'));
    }

    const id = `tpl_${Date.now()}`;

    const result = await query(
      `INSERT INTO notification_templates (
        id, name, type, channel, subject, template_body,
        template_variables, priority, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [id, name, type, channel, subject, templateBody, JSON.stringify(templateVariables || []), priority || 0, createdBy]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Template created'));
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create template'));
  }
});

// ==================== PUSH TOKENS ====================

/**
 * POST /api/notifications/push-tokens - Register push token
 */
router.post('/push-tokens', async (req: Request, res: Response) => {
  try {
    const { userId, userType, token, deviceType, deviceName } = req.body;

    if (!userId || !token) {
      return res.status(400).json(createResponse(false, undefined, 'User ID and token required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, { token }, 'Token registered'));
    }

    // Upsert token
    await query(
      `INSERT INTO push_tokens (user_id, user_type, token, device_type, device_name, last_used_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, token) DO UPDATE SET
         last_used_at = CURRENT_TIMESTAMP,
         device_name = COALESCE($5, push_tokens.device_name)`,
      [userId, userType || 'customer', token, deviceType, deviceName]
    );

    res.status(201).json(createResponse(true, { token }, 'Token registered'));
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to register token'));
  }
});

/**
 * DELETE /api/notifications/push-tokens - Remove push token
 */
router.delete('/push-tokens', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json(createResponse(false, undefined, 'User ID and token required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Token removed'));
    }

    await query(
      'UPDATE push_tokens SET is_active = FALSE WHERE user_id = $1 AND token = $2',
      [userId, token]
    );

    res.status(200).json(createResponse(true, undefined, 'Token removed'));
  } catch (error) {
    console.error('Error removing push token:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to remove token'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/notifications/stats - Get notification statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        byChannel: {},
        byType: {},
      }));
    }

    let whereClause = '';
    const params: unknown[] = [];
    
    if (userId) {
      whereClause = 'WHERE recipient_id = $1';
      params.push(userId);
    }

    const [totals, byChannel, byType] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'read')) as total_sent,
          COUNT(*) FILTER (WHERE status IN ('delivered', 'read')) as total_delivered,
          COUNT(*) FILTER (WHERE status = 'read') as total_read
        FROM notifications ${whereClause}
      `, params),
      query(`
        SELECT channel, COUNT(*) as count
        FROM notifications ${whereClause}
        GROUP BY channel
      `, params),
      query(`
        SELECT type, COUNT(*) as count
        FROM notifications ${whereClause}
        GROUP BY type
      `, params),
    ]);

    const totalsRow = totals.rows[0] as Record<string, unknown> || {};

    res.status(200).json(createResponse(true, {
      totalSent: parseInt(totalsRow.total_sent as string || '0'),
      totalDelivered: parseInt(totalsRow.total_delivered as string || '0'),
      totalRead: parseInt(totalsRow.total_read as string || '0'),
      byChannel: byChannel.rows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
        acc[row.channel as string] = parseInt(row.count as string);
        return acc;
      }, {}),
      byType: byType.rows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
        acc[row.type as string] = parseInt(row.count as string);
        return acc;
      }, {}),
    }));
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

export default router;
