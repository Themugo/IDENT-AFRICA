/**
 * Automation API Routes
 * Event-driven workflow automation system
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

// ==================== WORKFLOWS ====================

/**
 * GET /api/automation/workflows - Get all workflows
 */
router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const { status, event, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        workflows: [
          {
            id: 'wf_1',
            name: 'Booking Confirmation Email',
            description: 'Send confirmation email when a booking is created',
            trigger_event: 'booking.created',
            actions: [
              { type: 'send_email', template: 'booking_confirmation' },
              { type: 'send_notification', template: 'new_booking_admin' },
            ],
            status: 'active',
            priority: 10,
            trigger_count: 156,
            success_count: 154,
            failure_count: 2,
          },
          {
            id: 'wf_2',
            name: 'Payment Confirmation',
            description: 'Send payment receipt and update booking status',
            trigger_event: 'payment.completed',
            actions: [
              { type: 'send_email', template: 'payment_receipt' },
              { type: 'update_status', status: 'confirmed' },
              { type: 'generate_document', document_type: 'invoice' },
            ],
            status: 'active',
            priority: 20,
            trigger_count: 98,
            success_count: 97,
            failure_count: 1,
          },
          {
            id: 'wf_3',
            name: 'Supplier Approval Notification',
            description: 'Notify supplier when approved',
            trigger_event: 'supplier.approved',
            actions: [
              { type: 'send_email', template: 'supplier_approval' },
              { type: 'notify_supplier', message: 'Your supplier application has been approved!' },
            ],
            status: 'active',
            priority: 15,
            trigger_count: 12,
            success_count: 12,
            failure_count: 0,
          },
          {
            id: 'wf_4',
            name: 'Review Submitted',
            description: 'Thank customer for review',
            trigger_event: 'review.submitted',
            actions: [
              { type: 'send_email', template: 'review_confirmation' },
              { type: 'notify_supplier', template: 'review_submitted_supplier' },
            ],
            status: 'active',
            priority: 25,
            trigger_count: 45,
            success_count: 44,
            failure_count: 1,
          },
        ],
        total: 4,
      }));
    }

    let sql = 'SELECT * FROM workflows WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (event) {
      sql += ` AND trigger_event = $${paramIndex++}`;
      params.push(event);
    }

    sql += ' ORDER BY priority ASC';
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { workflows: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch workflows'));
  }
});

/**
 * GET /api/automation/workflows/:id - Get workflow details
 */
router.get('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        id,
        name: 'Booking Confirmation Email',
        description: 'Send confirmation email when a booking is created',
        trigger_event: 'booking.created',
        trigger_conditions: {},
        actions: [
          { type: 'send_email', template: 'booking_confirmation' },
          { type: 'send_notification', template: 'new_booking_admin' },
        ],
        status: 'active',
        priority: 10,
        max_retries: 3,
        retry_delay_seconds: 60,
        timeout_seconds: 300,
        trigger_count: 156,
        success_count: 154,
        failure_count: 2,
        success_rate: 98.7,
      }));
    }

    const result = await query('SELECT * FROM workflows WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Workflow not found'));
    }

    const workflow = result.rows[0] as Record<string, unknown>;
    const successRate = (workflow.trigger_count as number) > 0
      ? ((workflow.success_count as number) / (workflow.trigger_count as number)) * 100
      : 0;

    res.status(200).json(createResponse(true, { ...workflow, success_rate: successRate.toFixed(1) }));
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch workflow'));
  }
});

/**
 * POST /api/automation/workflows - Create workflow
 */
router.post('/workflows', async (req: Request, res: Response) => {
  try {
    const { name, description, triggerEvent, triggerConditions, actions, priority, maxRetries, timeoutSeconds } = req.body;

    if (!name || !triggerEvent || !actions) {
      return res.status(400).json(createResponse(false, undefined, 'Name, trigger event, and actions required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `wf_${Date.now()}`,
        name,
        trigger_event: triggerEvent,
        actions,
        status: 'active',
        priority: priority || 100,
        trigger_count: 0,
        success_count: 0,
        failure_count: 0,
      }));
    }

    const result = await query(
      `INSERT INTO workflows (name, description, trigger_event, trigger_conditions, actions, priority, max_retries, timeout_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, triggerEvent, JSON.stringify(triggerConditions || {}), JSON.stringify(actions), priority || 100, maxRetries || 3, timeoutSeconds || 300]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Workflow created'));
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create workflow'));
  }
});

/**
 * PUT /api/automation/workflows/:id - Update workflow
 */
router.put('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, triggerEvent, triggerConditions, actions, status, priority, maxRetries, timeoutSeconds } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Workflow updated'));
    }

    await query(
      `UPDATE workflows SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        trigger_event = COALESCE($3, trigger_event),
        trigger_conditions = COALESCE($4, trigger_conditions),
        actions = COALESCE($5, actions),
        status = COALESCE($6, status),
        priority = COALESCE($7, priority),
        max_retries = COALESCE($8, max_retries),
        timeout_seconds = COALESCE($9, timeout_seconds),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
      [name, description, triggerEvent, triggerConditions ? JSON.stringify(triggerConditions) : null, actions ? JSON.stringify(actions) : null, status, priority, maxRetries, timeoutSeconds, id]
    );

    res.status(200).json(createResponse(true, undefined, 'Workflow updated'));
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update workflow'));
  }
});

/**
 * DELETE /api/automation/workflows/:id - Delete workflow
 */
router.delete('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Workflow deleted'));
    }

    await query('DELETE FROM workflows WHERE id = $1', [id]);
    res.status(200).json(createResponse(true, undefined, 'Workflow deleted'));
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete workflow'));
  }
});

// ==================== EVENTS ====================

/**
 * POST /api/automation/events - Trigger an event
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { eventType, entityType, entityId, payload } = req.body;

    if (!eventType || !entityType || !entityId) {
      return res.status(400).json(createResponse(false, undefined, 'Event type, entity type, and entity ID required'));
    }

    if (!isDatabaseConnected()) {
      const executionId = `exec_${Date.now()}`;
      return res.status(201).json(createResponse(true, {
        event_id: `evt_${Date.now()}`,
        event_type: eventType,
        triggered_workflows: ['wf_1'],
        execution_id: executionId,
        actions_executed: [
          { action: 'send_email', status: 'success' },
          { action: 'send_notification', status: 'success' },
        ],
      }));
    }

    // Log the event
    const eventResult = await query(
      `INSERT INTO automation_events (event_type, entity_type, entity_id, payload)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [eventType, entityType, entityId, JSON.stringify(payload || {})]
    );

    const eventId = (eventResult.rows[0] as Record<string, unknown>).id;

    // Find matching workflows
    const workflowsResult = await query(
      'SELECT * FROM workflows WHERE trigger_event = $1 AND status = $2 ORDER BY priority ASC',
      [eventType, 'active']
    );

    const triggeredWorkflows: string[] = [];

    // Execute each workflow
    for (const workflow of workflowsResult.rows) {
      const wf = workflow as Record<string, unknown>;
      triggeredWorkflows.push(wf.id as string);

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const actions = wf.actions as Array<Record<string, unknown>>;

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        // Log action start
        await query(
          `INSERT INTO workflow_logs (
            workflow_id, workflow_name, event_id, execution_id,
            entity_type, entity_id, action_index, action_type, action_config, status, started_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'running', CURRENT_TIMESTAMP)`,
          [wf.id, wf.name, eventId, executionId, entityType, entityId, i, action.type, JSON.stringify(action)]
        );

        // Execute action (simplified - in production this would call actual services)
        const actionResult = await executeAction(action, payload || {});

        // Log action result
        await query(
          `UPDATE workflow_logs SET 
            status = $1,
            completed_at = CURRENT_TIMESTAMP,
            duration_ms = EXTRACT(MILLISECONDS FROM (CURRENT_TIMESTAMP - started_at))::INT,
            result = $2,
            error_message = $3
           WHERE execution_id = $4 AND action_index = $5`,
          [actionResult.success ? 'success' : 'failed', JSON.stringify(actionResult.result), actionResult.error, executionId, i]
        );

        // Update workflow stats
        if (actionResult.success) {
          await query('UPDATE workflows SET success_count = success_count + 1, trigger_count = trigger_count + 1 WHERE id = $1', [wf.id]);
        } else {
          await query('UPDATE workflows SET failure_count = failure_count + 1, trigger_count = trigger_count + 1 WHERE id = $1', [wf.id]);
        }
      }
    }

    // Mark event as processed
    await query(
      'UPDATE automation_events SET processed = TRUE, processed_at = CURRENT_TIMESTAMP, triggered_workflows = $1 WHERE id = $2',
      [JSON.stringify(triggeredWorkflows), eventId]
    );

    res.status(201).json(createResponse(true, {
      event_id: eventId,
      event_type: eventType,
      triggered_workflows: triggeredWorkflows,
      actions_executed: triggeredWorkflows.length,
    }));
  } catch (error) {
    console.error('Error triggering event:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to trigger event'));
  }
});

/**
 * GET /api/automation/events - Get event history
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { eventType, entityType, processed, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        events: [
          { id: 'evt_1', event_type: 'booking.created', entity_type: 'booking', entity_id: 'book_001', processed: true, triggered_workflows: ['wf_1'], created_at: new Date().toISOString() },
          { id: 'evt_2', event_type: 'payment.completed', entity_type: 'payment', entity_id: 'pay_001', processed: true, triggered_workflows: ['wf_2'], created_at: new Date().toISOString() },
          { id: 'evt_3', event_type: 'supplier.approved', entity_type: 'supplier', entity_id: 'supp_001', processed: true, triggered_workflows: ['wf_3'], created_at: new Date().toISOString() },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM automation_events WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (eventType) {
      sql += ` AND event_type = $${paramIndex++}`;
      params.push(eventType);
    }
    if (entityType) {
      sql += ` AND entity_type = $${paramIndex++}`;
      params.push(entityType);
    }
    if (processed !== undefined) {
      sql += ` AND processed = $${paramIndex++}`;
      params.push(processed === 'true');
    }

    sql += ' ORDER BY created_at DESC';
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { events: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch events'));
  }
});

// ==================== WORKFLOW LOGS ====================

/**
 * GET /api/automation/logs - Get workflow execution logs
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { workflowId, eventId, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        logs: [
          {
            id: 'log_1',
            workflow_id: 'wf_1',
            workflow_name: 'Booking Confirmation Email',
            execution_id: 'exec_001',
            entity_type: 'booking',
            entity_id: 'book_001',
            action_type: 'send_email',
            status: 'success',
            started_at: new Date(Date.now() - 5000).toISOString(),
            completed_at: new Date().toISOString(),
            duration_ms: 120,
          },
          {
            id: 'log_2',
            workflow_id: 'wf_1',
            workflow_name: 'Booking Confirmation Email',
            execution_id: 'exec_001',
            entity_type: 'booking',
            entity_id: 'book_001',
            action_type: 'send_notification',
            status: 'success',
            started_at: new Date(Date.now() - 3000).toISOString(),
            completed_at: new Date().toISOString(),
            duration_ms: 45,
          },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM workflow_logs WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (workflowId) {
      sql += ` AND workflow_id = $${paramIndex++}`;
      params.push(workflowId);
    }
    if (eventId) {
      sql += ` AND event_id = $${paramIndex++}`;
      params.push(eventId);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { logs: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch logs'));
  }
});

/**
 * GET /api/automation/logs/:executionId - Get execution details
 */
router.get('/logs/:executionId', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        execution_id: executionId,
        workflow_name: 'Booking Confirmation Email',
        actions: [
          { action_index: 0, action_type: 'send_email', status: 'success', duration_ms: 120 },
          { action_index: 1, action_type: 'send_notification', status: 'success', duration_ms: 45 },
        ],
        total_duration_ms: 165,
      }));
    }

    const result = await query(
      'SELECT * FROM workflow_logs WHERE execution_id = $1 ORDER BY action_index ASC',
      [executionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Execution not found'));
    }

    const logs = result.rows as Record<string, unknown>[];
    const totalDuration = logs.reduce((sum, log) => sum + ((log.duration_ms as number) || 0), 0);

    res.status(200).json(createResponse(true, {
      execution_id: executionId,
      workflow_name: logs[0].workflow_name,
      entity_type: logs[0].entity_type,
      entity_id: logs[0].entity_id,
      actions: logs.map(log => ({
        action_index: log.action_index,
        action_type: log.action_type,
        status: log.status,
        started_at: log.started_at,
        completed_at: log.completed_at,
        duration_ms: log.duration_ms,
        error_message: log.error_message,
        result: log.result,
      })),
      total_duration_ms: totalDuration,
    }));
  } catch (error) {
    console.error('Error fetching execution:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch execution'));
  }
});

// ==================== TEMPLATES ====================

/**
 * GET /api/automation/templates/email - Get email templates
 */
router.get('/templates/email', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        templates: [
          { id: 'tpl_1', name: 'booking_confirmation', subject: 'Booking Confirmed - {{booking_reference}}', variables: ['customer_name', 'booking_reference'] },
          { id: 'tpl_2', name: 'payment_receipt', subject: 'Payment Received - {{booking_reference}}', variables: ['customer_name', 'booking_reference', 'amount'] },
          { id: 'tpl_3', name: 'supplier_approval', subject: 'Supplier Application Approved', variables: ['supplier_name'] },
          { id: 'tpl_4', name: 'review_confirmation', subject: 'Thank You for Your Review', variables: ['customer_name', 'safari_name'] },
        ],
      }));
    }

    const result = await query('SELECT * FROM email_templates WHERE is_active = TRUE ORDER BY name');
    res.status(200).json(createResponse(true, { templates: result.rows }));
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch templates'));
  }
});

/**
 * GET /api/automation/templates/notification - Get notification templates
 */
router.get('/templates/notification', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        templates: [
          { id: 'ntpl_1', name: 'new_booking_admin', title: 'New Booking', channels: ['in_app', 'email'] },
          { id: 'ntpl_2', name: 'payment_received_admin', title: 'Payment Received', channels: ['in_app'] },
          { id: 'ntpl_3', name: 'supplier_approved_admin', title: 'Supplier Approved', channels: ['in_app', 'email'] },
          { id: 'ntpl_4', name: 'review_submitted_supplier', title: 'New Review', channels: ['in_app', 'email'] },
        ],
      }));
    }

    const result = await query('SELECT * FROM notification_templates WHERE is_active = TRUE ORDER BY name');
    res.status(200).json(createResponse(true, { templates: result.rows }));
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch templates'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/automation/stats - Get automation statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        total_workflows: 4,
        active_workflows: 4,
        total_events: 311,
        events_today: 15,
        events_this_week: 89,
        total_executions: 1245,
        successful_executions: 1222,
        failed_executions: 23,
        success_rate: 98.2,
        by_event_type: {
          'booking.created': 156,
          'payment.completed': 98,
          'supplier.approved': 12,
          'review.submitted': 45,
        },
      }));
    }

    const [workflowStats, eventStats, executionStats] = await Promise.all([
      query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM workflows', ['active']),
      query(`
        SELECT COUNT(*) as total,
          COUNT(*) FILTER (WHERE created_at > CURRENT_DATE) as today,
          COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL $1) as this_week
        FROM automation_events
      `, ['7 days']),
      query(`
        SELECT COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = $1) as success,
          COUNT(*) FILTER (WHERE status = $2) as failed
        FROM workflow_logs
      `, ['success', 'failed']),
    ]);

    const wStats = workflowStats.rows[0] as Record<string, unknown> || {};
    const eStats = eventStats.rows[0] as Record<string, unknown> || {};
    const xStats = executionStats.rows[0] as Record<string, unknown> || {};

    const totalExec = parseInt(xStats.total as string || '0');
    const successRate = totalExec > 0 ? ((parseInt(xStats.success as string || '0') / totalExec) * 100) : 0;

    res.status(200).json(createResponse(true, {
      total_workflows: parseInt(wStats.total as string || '0'),
      active_workflows: parseInt(wStats.active as string || '0'),
      total_events: parseInt(eStats.total as string || '0'),
      events_today: parseInt(eStats.today as string || '0'),
      events_this_week: parseInt(eStats.this_week as string || '0'),
      total_executions: totalExec,
      successful_executions: parseInt(xStats.success as string || '0'),
      failed_executions: parseInt(xStats.failed as string || '0'),
      success_rate: successRate.toFixed(1),
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

// ==================== EVENT TYPES ====================

/**
 * GET /api/automation/event-types - Get available event types
 */
router.get('/event-types', async (req: Request, res: Response) => {
  try {
    const eventTypes = [
      { id: 'booking.created', name: 'Booking Created', description: 'Triggered when a new booking is created', category: 'booking' },
      { id: 'booking.updated', name: 'Booking Updated', description: 'Triggered when a booking is updated', category: 'booking' },
      { id: 'booking.cancelled', name: 'Booking Cancelled', description: 'Triggered when a booking is cancelled', category: 'booking' },
      { id: 'payment.completed', name: 'Payment Completed', description: 'Triggered when payment is successfully processed', category: 'payment' },
      { id: 'payment.failed', name: 'Payment Failed', description: 'Triggered when payment fails', category: 'payment' },
      { id: 'payment.refunded', name: 'Payment Refunded', description: 'Triggered when a payment is refunded', category: 'payment' },
      { id: 'supplier.approved', name: 'Supplier Approved', description: 'Triggered when a supplier is approved', category: 'supplier' },
      { id: 'supplier.rejected', name: 'Supplier Rejected', description: 'Triggered when a supplier is rejected', category: 'supplier' },
      { id: 'supplier.suspended', name: 'Supplier Suspended', description: 'Triggered when a supplier is suspended', category: 'supplier' },
      { id: 'review.submitted', name: 'Review Submitted', description: 'Triggered when a review is submitted', category: 'review' },
      { id: 'review.approved', name: 'Review Approved', description: 'Triggered when a review is approved', category: 'review' },
      { id: 'document.generated', name: 'Document Generated', description: 'Triggered when a document is generated', category: 'document' },
      { id: 'notification.sent', name: 'Notification Sent', description: 'Triggered when a notification is sent', category: 'notification' },
      { id: 'loyalty.points_earned', name: 'Points Earned', description: 'Triggered when loyalty points are earned', category: 'loyalty' },
      { id: 'loyalty.tier_upgraded', name: 'Tier Upgraded', description: 'Triggered when customer tier is upgraded', category: 'loyalty' },
    ];

    res.status(200).json(createResponse(true, { event_types: eventTypes }));
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch event types'));
  }
});

/**
 * GET /api/automation/action-types - Get available action types
 */
router.get('/action-types', async (req: Request, res: Response) => {
  try {
    const actionTypes = [
      { id: 'send_email', name: 'Send Email', description: 'Send an email using a template', icon: '📧' },
      { id: 'send_notification', name: 'Send Notification', description: 'Send an in-app notification', icon: '🔔' },
      { id: 'update_status', name: 'Update Status', description: 'Update the status of an entity', icon: '📝' },
      { id: 'generate_document', name: 'Generate Document', description: 'Generate a document (invoice, contract, etc.)', icon: '📄' },
      { id: 'notify_supplier', name: 'Notify Supplier', description: 'Send notification to supplier', icon: '🏪' },
      { id: 'webhook', name: 'Webhook', description: 'Call an external webhook', icon: '🌐' },
      { id: 'slack_message', name: 'Slack Message', description: 'Send a message to Slack', icon: '💬' },
      { id: 'sms', name: 'Send SMS', description: 'Send an SMS message', icon: '📱' },
      { id: 'loyalty_award', name: 'Award Loyalty Points', description: 'Award loyalty points to customer', icon: '⭐' },
    ];

    res.status(200).json(createResponse(true, { action_types: actionTypes }));
  } catch (error) {
    console.error('Error fetching action types:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch action types'));
  }
});

// Helper function to execute an action
async function executeAction(action: Record<string, unknown>, payload: Record<string, unknown>): Promise<{ success: boolean; result: Record<string, unknown>; error?: string }> {
  try {
    switch (action.type) {
      case 'send_email':
        // In production, this would call email service
        console.log('Sending email with template:', action.template);
        return { success: true, result: { message: 'Email sent successfully' } };

      case 'send_notification':
        // In production, this would call notification service
        console.log('Sending notification:', action.template || action.message);
        return { success: true, result: { message: 'Notification sent' } };

      case 'update_status':
        // In production, this would update entity status
        console.log('Updating status to:', action.status);
        return { success: true, result: { status: action.status } };

      case 'generate_document':
        // In production, this would generate a document
        console.log('Generating document:', action.document_type);
        return { success: true, result: { document_type: action.document_type } };

      case 'notify_supplier':
        // In production, this would notify supplier
        console.log('Notifying supplier:', action.message);
        return { success: true, result: { message: 'Supplier notified' } };

      case 'webhook':
        // In production, this would call external webhook
        console.log('Calling webhook:', action.url);
        return { success: true, result: { webhook_response: 'OK' } };

      case 'slack_message':
        // In production, this would post to Slack
        console.log('Posting to Slack:', action.channel);
        return { success: true, result: { slack_response: 'ok' } };

      case 'sms':
        // In production, this would send SMS
        console.log('Sending SMS to:', action.phone);
        return { success: true, result: { sms_id: 'sent' } };

      case 'loyalty_award':
        // In production, this would award loyalty points
        console.log('Awarding loyalty points:', action.points);
        return { success: true, result: { points_awarded: action.points } };

      default:
        return { success: false, result: {}, error: `Unknown action type: ${action.type}` };
    }
  } catch (error) {
    return { success: false, result: {}, error: String(error) };
  }
}

export default router;
