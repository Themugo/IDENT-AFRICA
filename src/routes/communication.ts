/**
 * Communication Center API Routes
 * Centralized communication with workflow triggers
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

// ==================== CONVERSATIONS ====================

/**
 * GET /api/communication/conversations - Get conversations
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { userId, userType, type, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      // Mock data
      return res.status(200).json(createResponse(true, {
        conversations: [
          {
            id: 'conv_1',
            conversation_code: 'CUST_ADMIN_001',
            type: 'customer_admin',
            participant_a: { id: 'user_001', name: 'John Smith', type: 'customer' },
            participant_b: { id: 'admin_001', name: 'IDENT Support', type: 'admin' },
            subject: 'Booking Inquiry',
            status: 'active',
            last_message: { content: 'Thank you for your inquiry!', at: new Date().toISOString() },
            unread_count: 2,
          },
          {
            id: 'conv_2',
            conversation_code: 'CUST_SUPP_001',
            type: 'customer_supplier',
            participant_a: { id: 'user_002', name: 'Jane Doe', type: 'customer' },
            participant_b: { id: 'supp_001', name: 'Safari Adventures', type: 'supplier' },
            subject: 'Safari Booking #12345',
            related_entity: { type: 'booking', id: 'book_12345' },
            status: 'active',
            last_message: { content: 'Your booking has been confirmed!', at: new Date().toISOString() },
            unread_count: 0,
          },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM conversations WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    // Filter by participant
    if (userId) {
      sql += ` AND ((participant_a_id = $${paramIndex}) OR (participant_b_id = $${paramIndex++}))`;
      params.push(userId);
    }
    if (type) {
      sql += ` AND conversation_type = $${paramIndex++}`;
      params.push(type);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY last_message_at DESC NULLS LAST LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      conversations: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch conversations'));
  }
});

/**
 * POST /api/communication/conversations - Create conversation
 */
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const {
      type,
      participantAId,
      participantAType,
      participantAName,
      participantBId,
      participantBType,
      participantBName,
      subject,
      relatedEntityType,
      relatedEntityId,
      initialMessage,
    } = req.body;

    if (!type || !participantAId || !participantBId) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    const code = `${type.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (!isDatabaseConnected()) {
      const mockConversation = {
        id: `conv_${Date.now()}`,
        conversation_code: code,
        type,
        participant_a_id: participantAId,
        participant_a_type: participantAType,
        participant_a_name: participantAName,
        participant_b_id: participantBId,
        participant_b_type: participantBType,
        participant_b_name: participantBName,
        subject,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockConversation));
    }

    const result = await query(
      `INSERT INTO conversations (
        conversation_type, conversation_code,
        participant_a_id, participant_a_type, participant_a_name,
        participant_b_id, participant_b_type, participant_b_name,
        subject, related_entity_type, related_entity_id,
        last_message_at, unread_count_a, unread_count_b
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, 0, 0)
      RETURNING *`,
      [
        type, code,
        participantAId, participantAType, participantAName,
        participantBId, participantBType, participantBName,
        subject, relatedEntityType, relatedEntityId,
      ]
    );

    // Send initial message if provided
    if (initialMessage) {
      await query(
        `INSERT INTO messages (
          conversation_id, sender_id, sender_type, sender_name,
          content, message_type, is_system_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          (result.rows[0] as Record<string, unknown>).id, participantAId, participantAType, participantAName,
          initialMessage, 'text', participantAType === 'system',
        ]
      );
    }

    res.status(201).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create conversation'));
  }
});

/**
 * GET /api/communication/conversations/:id - Get conversation details
 */
router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        id,
        conversation_code: 'CUST_ADMIN_001',
        type: 'customer_admin',
        participant_a: { id: 'user_001', name: 'John Smith', type: 'customer' },
        participant_b: { id: 'admin_001', name: 'IDENT Support', type: 'admin' },
        status: 'active',
        messages: [],
      }));
    }

    const result = await query('SELECT * FROM conversations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Conversation not found'));
    }

    const messagesResult = await query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.status(200).json(createResponse(true, {
      ...(result.rows[0] as Record<string, unknown>),
      messages: messagesResult.rows,
    }));
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch conversation'));
  }
});

/**
 * PUT /api/communication/conversations/:id - Update conversation
 */
router.put('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote, resolvedBy } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Conversation updated'));
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
      if (status === 'resolved') {
        updates.push(`resolved_at = CURRENT_TIMESTAMP`);
        updates.push(`resolved_by = $${paramIndex++}`);
        params.push(resolvedBy);
      }
    }
    if (resolutionNote) {
      updates.push(`resolution_note = $${paramIndex++}`);
      params.push(resolutionNote);
    }

    if (updates.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'No updates provided'));
    }

    params.push(id);
    const result = await query(
      `UPDATE conversations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Conversation not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update conversation'));
  }
});

/**
 * POST /api/communication/conversations/:id/messages - Send message in conversation
 */
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      senderId,
      senderType,
      senderName,
      content,
      messageType = 'text',
    } = req.body;

    if (!senderId || !content) {
      return res.status(400).json(createResponse(false, undefined, 'Sender and content required'));
    }

    if (!isDatabaseConnected()) {
      const mockMessage = {
        id: `msg_${Date.now()}`,
        conversation_id: id,
        sender_id: senderId,
        sender_type: senderType,
        sender_name: senderName,
        content,
        message_type: messageType,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockMessage));
    }

    // Insert message
    const messageResult = await query(
      `INSERT INTO messages (
        conversation_id, sender_id, sender_type, sender_name,
        content, message_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id, senderId, senderType, senderName, content, messageType]
    );

    // Update conversation
    await query(
      `UPDATE conversations SET 
        last_message_at = CURRENT_TIMESTAMP,
        last_message_preview = $1,
        unread_count_a = COALESCE(unread_count_a, 0) + 1,
        unread_count_b = COALESCE(unread_count_b, 0) + 1
       WHERE id = $2`,
      [content.substring(0, 100), id]
    );

    // Create notification for recipient
    const convResult = await query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (convResult.rows.length > 0) {
      const conv = convResult.rows[0] as Record<string, unknown>;
      const recipientId = conv.participant_a_id === senderId ? conv.participant_b_id : conv.participant_a_id;
      
      if (recipientId) {
        await query(
          `INSERT INTO notifications (
            recipient_id, recipient_type, type, channel,
            subject, message, status, sent_at
          ) VALUES ($1, $2, 'supplier_message', 'push',
            $3, $4, 'sent', CURRENT_TIMESTAMP)`,
          [
            recipientId,
            conv.participant_a_id === senderId ? conv.participant_b_type : conv.participant_a_type,
            `New message from ${senderName}`,
            content.substring(0, 100),
          ]
        );
      }
    }

    res.status(201).json(createResponse(true, messageResult.rows[0]));
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to send message'));
  }
});

// ==================== WORKFLOW TRIGGERS ====================

/**
 * POST /api/communication/triggers - Create workflow trigger
 */
router.post('/triggers', async (req: Request, res: Response) => {
  try {
    const {
      triggerType,
      entityType,
      entityId,
      channels = ['email'],
      recipientId,
      recipientType,
      recipientEmail,
      recipientPhone,
      subject,
      messageTemplate,
      messageVariables,
      scheduledFor,
    } = req.body;

    if (!triggerType || !entityType || !entityId || !recipientId) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    if (!isDatabaseConnected()) {
      const mockWorkflow = {
        id: `wf_${Date.now()}`,
        trigger_type: triggerType,
        trigger_entity_type: entityType,
        trigger_entity_id: entityId,
        channels,
        recipient_id: recipientId,
        recipient_type: recipientType,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockWorkflow, 'Workflow created'));
    }

    const id = `wf_${Date.now()}`;

    const result = await query(
      `INSERT INTO communication_workflows (
        id, trigger_type, trigger_entity_type, trigger_entity_id,
        channels, recipient_id, recipient_type, recipient_email, recipient_phone,
        subject, message_template, message_variables, scheduled_for, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        id, triggerType, entityType, entityId,
        JSON.stringify(channels), recipientId, recipientType, recipientEmail, recipientPhone,
        subject, messageTemplate, JSON.stringify(messageVariables || {}), scheduledFor,
        scheduledFor ? 'pending' : 'processing',
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Workflow created'));
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create workflow'));
  }
});

/**
 * GET /api/communication/triggers - Get workflow triggers
 */
router.get('/triggers', async (req: Request, res: Response) => {
  try {
    const { triggerType, entityType, entityId, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        workflows: [
          {
            id: 'wf_1',
            trigger_type: 'booking_created',
            trigger_entity_type: 'booking',
            trigger_entity_id: 'book_12345',
            channels: ['email', 'push'],
            recipient_id: 'user_001',
            status: 'completed',
            created_at: new Date().toISOString(),
          },
          {
            id: 'wf_2',
            trigger_type: 'travel_reminder',
            trigger_entity_type: 'booking',
            trigger_entity_id: 'book_12345',
            channels: ['email', 'whatsapp'],
            recipient_id: 'user_001',
            status: 'pending',
            scheduled_for: new Date(Date.now() + 86400000).toISOString(),
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM communication_workflows WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (triggerType) {
      sql += ` AND trigger_type = $${paramIndex++}`;
      params.push(triggerType);
    }
    if (entityType && entityId) {
      sql += ` AND trigger_entity_type = $${paramIndex++} AND trigger_entity_id = $${paramIndex++}`;
      params.push(entityType, entityId);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      workflows: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch workflows'));
  }
});

/**
 * POST /api/communication/triggers/execute/:id - Execute workflow
 */
router.post('/triggers/execute/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Workflow executed'));
    }

    // Get workflow
    const wfResult = await query('SELECT * FROM communication_workflows WHERE id = $1', [id]);
    if (wfResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Workflow not found'));
    }

    const workflow = wfResult.rows[0] as Record<string, unknown>;
    const channels = workflow.channels as string[];
    const notifications: string[] = [];

    // Send notifications for each channel
    for (const channel of channels) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      await query(
        `INSERT INTO notifications (
          id, recipient_id, recipient_type, recipient_email, recipient_phone,
          type, channel, subject, message, metadata,
          related_entity_type, related_entity_id,
          status, sent_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'sent', CURRENT_TIMESTAMP)`,
        [
          notifId,
          workflow.recipient_id,
          workflow.recipient_type,
          workflow.recipient_email,
          workflow.recipient_phone,
          workflow.trigger_type,
          channel,
          workflow.subject,
          'Message content from workflow',
          JSON.stringify(workflow.message_variables || {}),
          workflow.trigger_entity_type,
          workflow.trigger_entity_id,
        ]
      );
      
      notifications.push(notifId);
    }

    // Update workflow
    await query(
      `UPDATE communication_workflows SET 
        status = 'completed',
        executed_at = CURRENT_TIMESTAMP,
        notifications = $1
       WHERE id = $2`,
      [JSON.stringify(notifications), id]
    );

    res.status(200).json(createResponse(true, { notifications }));
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to execute workflow'));
  }
});

/**
 * POST /api/communication/triggers/booking - Trigger booking workflow
 */
router.post('/triggers/booking', async (req: Request, res: Response) => {
  try {
    const { bookingId, bookingData, triggerType } = req.body;

    if (!bookingId || !triggerType) {
      return res.status(400).json(createResponse(false, undefined, 'Booking ID and trigger type required'));
    }

    const workflows: unknown[] = [];

    // Define templates for each trigger
    const templates: Record<string, { subject: string; message: string; channels: string[] }> = {
      booking_created: {
        subject: 'Booking Confirmed - #{{bookingId}}',
        message: 'Your booking #{{bookingId}} has been created. Total: {{totalAmount}} {{currency}}.',
        channels: ['email', 'push'],
      },
      booking_confirmed: {
        subject: 'Payment Received - Booking #{{bookingId}}',
        message: 'Payment of {{totalAmount}} {{currency}} received for booking #{{bookingId}}. Your booking is now confirmed!',
        channels: ['email', 'sms', 'whatsapp', 'push'],
      },
      booking_cancelled: {
        subject: 'Booking Cancelled - #{{bookingId}}',
        message: 'Booking #{{bookingId}} has been cancelled. {{refundInfo}}',
        channels: ['email', 'sms', 'push'],
      },
      payment_received: {
        subject: 'Payment Confirmation - #{{bookingId}}',
        message: 'Payment of {{amount}} {{currency}} received for booking #{{bookingId}}.',
        channels: ['email', 'push'],
      },
      payment_failed: {
        subject: 'Payment Failed - #{{bookingId}}',
        message: 'Payment for booking #{{bookingId}} failed. Please update your payment method.',
        channels: ['email', 'sms', 'push'],
      },
      travel_reminder: {
        subject: 'Travel Reminder - #{{bookingId}}',
        message: 'Your trip is in {{daysUntil}} days! Booking #{{bookingId}} starts on {{startDate}}.',
        channels: ['email', 'whatsapp', 'push'],
      },
      refund_initiated: {
        subject: 'Refund Initiated - #{{bookingId}}',
        message: 'Your refund of {{amount}} {{currency}} has been initiated for booking #{{bookingId}}.',
        channels: ['email', 'push'],
      },
    };

    const template = templates[triggerType];
    if (!template) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid trigger type'));
    }

    // Create workflow for customer
    const customerWorkflow = await fetch(`${req.protocol}://${req.get('host')}/api/communication/triggers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triggerType,
        entityType: 'booking',
        entityId: bookingId,
        channels: template.channels,
        recipientId: bookingData?.customerId,
        recipientType: 'customer',
        recipientEmail: bookingData?.customerEmail,
        recipientPhone: bookingData?.customerPhone,
        subject: template.subject.replace('{{bookingId}}', bookingId),
        messageVariables: bookingData,
      }),
    });

    workflows.push(await customerWorkflow.json());

    // Also notify supplier if relevant
    if (['booking_created', 'booking_confirmed', 'travel_reminder'].includes(triggerType) && bookingData?.supplierId) {
      const supplierWorkflow = await fetch(`${req.protocol}://${req.get('host')}/api/communication/triggers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: 'booking_created',
          entityType: 'booking',
          entityId: bookingId,
          channels: ['email', 'push'],
          recipientId: bookingData.supplierId,
          recipientType: 'supplier',
          recipientEmail: bookingData.supplierEmail,
          subject: `New Booking - #${bookingId}`,
          messageVariables: bookingData,
        }),
      });
      workflows.push(await supplierWorkflow.json());
    }

    res.status(201).json(createResponse(true, { workflows }));
  } catch (error) {
    console.error('Error triggering booking workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to trigger workflow'));
  }
});

// ==================== PREFERENCES ====================

/**
 * GET /api/communication/preferences - Get communication preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res.status(400).json(createResponse(false, undefined, 'User ID and type required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        user_id: userId,
        user_type: userType,
        email_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        push_enabled: true,
        booking_updates: true,
        payment_alerts: true,
        promotional_messages: false,
        travel_reminders: true,
        system_alerts: true,
        quiet_hours_enabled: false,
      }));
    }

    const result = await query(
      'SELECT * FROM communication_preferences WHERE user_id = $1 AND user_type = $2',
      [userId, userType]
    );

    if (result.rows.length === 0) {
      // Return defaults
      return res.status(200).json(createResponse(true, {
        user_id: userId,
        user_type: userType,
        email_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        push_enabled: true,
        booking_updates: true,
        payment_alerts: true,
        promotional_messages: false,
        travel_reminders: true,
        system_alerts: true,
        quiet_hours_enabled: false,
      }));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch preferences'));
  }
});

/**
 * PUT /api/communication/preferences - Update communication preferences
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      userType,
      emailEnabled,
      smsEnabled,
      whatsappEnabled,
      pushEnabled,
      bookingUpdates,
      paymentAlerts,
      promotionalMessages,
      travelReminders,
      systemAlerts,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      quietHoursTimezone,
    } = req.body;

    if (!userId || !userType) {
      return res.status(400).json(createResponse(false, undefined, 'User ID and type required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Preferences updated'));
    }

    await query(
      `INSERT INTO communication_preferences (
        user_id, user_type,
        email_enabled, sms_enabled, whatsapp_enabled, push_enabled,
        booking_updates, payment_alerts, promotional_messages, travel_reminders, system_alerts,
        quiet_hours_enabled, quiet_hours_start, quiet_hours_end, quiet_hours_timezone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (user_id, user_type) DO UPDATE SET
        email_enabled = COALESCE($3, communication_preferences.email_enabled),
        sms_enabled = COALESCE($4, communication_preferences.sms_enabled),
        whatsapp_enabled = COALESCE($5, communication_preferences.whatsapp_enabled),
        push_enabled = COALESCE($6, communication_preferences.push_enabled),
        booking_updates = COALESCE($7, communication_preferences.booking_updates),
        payment_alerts = COALESCE($8, communication_preferences.payment_alerts),
        promotional_messages = COALESCE($9, communication_preferences.promotional_messages),
        travel_reminders = COALESCE($10, communication_preferences.travel_reminders),
        system_alerts = COALESCE($11, communication_preferences.system_alerts),
        quiet_hours_enabled = COALESCE($12, communication_preferences.quiet_hours_enabled),
        quiet_hours_start = COALESCE($13, communication_preferences.quiet_hours_start),
        quiet_hours_end = COALESCE($14, communication_preferences.quiet_hours_end),
        quiet_hours_timezone = COALESCE($15, communication_preferences.quiet_hours_timezone)`,
      [
        userId, userType,
        emailEnabled, smsEnabled, whatsappEnabled, pushEnabled,
        bookingUpdates, paymentAlerts, promotionalMessages, travelReminders, systemAlerts,
        quietHoursEnabled, quietHoursStart, quietHoursEnd, quietHoursTimezone,
      ]
    );

    res.status(200).json(createResponse(true, undefined, 'Preferences updated'));
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update preferences'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/communication/stats - Get communication statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        totalConversations: 24,
        activeConversations: 8,
        totalMessages: 156,
        messagesToday: 12,
        pendingWorkflows: 3,
        completedWorkflows: 45,
        byStatus: { active: 8, resolved: 16 },
        byType: { customer_admin: 10, customer_supplier: 12, supplier_admin: 2 },
      }));
    }

    let whereClause = '';
    const params: unknown[] = [];
    
    if (userId) {
      whereClause = 'WHERE (participant_a_id = $1 OR participant_b_id = $1)';
      params.push(userId);
    }

    const [convStats, workflowStats] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
          COUNT(*) FILTER (WHERE conversation_type = 'customer_admin') as customer_admin,
          COUNT(*) FILTER (WHERE conversation_type = 'customer_supplier') as customer_supplier,
          COUNT(*) FILTER (WHERE conversation_type = 'supplier_admin') as supplier_admin
        FROM conversations ${whereClause}
      `, params),
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM communication_workflows
        ${userId ? 'WHERE recipient_id = $1' : ''}
      `, params),
    ]);

    const convRow = convStats.rows[0] as Record<string, unknown> || {};
    const wfRow = workflowStats.rows[0] as Record<string, unknown> || {};

    res.status(200).json(createResponse(true, {
      totalConversations: parseInt(convRow.total as string || '0'),
      activeConversations: parseInt(convRow.active as string || '0'),
      resolvedConversations: parseInt(convRow.resolved as string || '0'),
      pendingWorkflows: parseInt(wfRow.pending as string || '0'),
      completedWorkflows: parseInt(wfRow.completed as string || '0'),
      failedWorkflows: parseInt(wfRow.failed as string || '0'),
      byType: {
        customer_admin: parseInt(convRow.customer_admin as string || '0'),
        customer_supplier: parseInt(convRow.customer_supplier as string || '0'),
        supplier_admin: parseInt(convRow.supplier_admin as string || '0'),
      },
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

export default router;
