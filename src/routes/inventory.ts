/**
 * Inventory API Routes
 * Real-time availability management for accommodations, transport, guides, activities
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

// ==================== INVENTORY MANAGEMENT ====================

/**
 * GET /api/inventory - List inventory items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { supplierId, productType, productId, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { items: [], total: 0 }));
    }

    let sql = 'SELECT i.*, s.name as supplier_name FROM inventory i LEFT JOIN suppliers s ON i.supplier_id = s.id WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (supplierId) {
      sql += ` AND i.supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }
    if (productType) {
      sql += ` AND i.product_type = $${paramIndex++}`;
      params.push(productType);
    }
    if (productId) {
      sql += ` AND i.product_id = $${paramIndex++}`;
      params.push(productId);
    }

    sql += ` ORDER BY i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      items: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch inventory'));
  }
});

/**
 * GET /api/inventory/:id - Get inventory item
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query(
      `SELECT i.*, s.name as supplier_name 
       FROM inventory i 
       LEFT JOIN suppliers s ON i.supplier_id = s.id 
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Inventory item not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch inventory item'));
  }
});

/**
 * POST /api/inventory - Create inventory item
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      supplierId,
      productId,
      productType,
      totalQuantity,
      availableQuantity,
      name,
      description,
      unitType,
      validFrom,
      validTo,
    } = req.body;

    if (!supplierId || !productId || !productType || !totalQuantity) {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Missing required fields',
        'supplierId, productId, productType, and totalQuantity are required'
      ));
    }

    if (!isDatabaseConnected()) {
      // Return mock response
      const mockItem = {
        id: `inv_${Date.now()}`,
        supplier_id: supplierId,
        product_id: productId,
        product_type: productType,
        total_quantity: totalQuantity,
        available_quantity: availableQuantity || totalQuantity,
        reserved_quantity: 0,
        blocked_quantity: 0,
        name: name || productId,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockItem, 'Inventory item created'));
    }

    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const availQty = availableQuantity ?? totalQuantity;

    const result = await query(
      `INSERT INTO inventory (
        id, supplier_id, product_id, product_type, total_quantity, 
        available_quantity, name, description, unit_type, valid_from, valid_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [id, supplierId, productId, productType, totalQuantity, availQty, name || productId, description, unitType || 'unit', validFrom, validTo]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Inventory item created'));
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create inventory item'));
  }
});

/**
 * PUT /api/inventory/:id - Update inventory item
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const allowedFields = [
      'total_quantity', 'available_quantity', 'reserved_quantity', 'blocked_quantity',
      'name', 'description', 'unit_type', 'valid_from', 'valid_to'
    ];

    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'No valid fields to update'));
    }

    params.push(id);
    const result = await query(
      `UPDATE inventory SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Inventory item not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0], 'Inventory item updated'));
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update inventory item'));
  }
});

/**
 * DELETE /api/inventory/:id - Delete inventory item
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query(
      'DELETE FROM inventory WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Inventory item not found'));
    }

    res.status(200).json(createResponse(true, undefined, 'Inventory item deleted'));
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete inventory item'));
  }
});

// ==================== AVAILABILITY CHECK ====================

/**
 * POST /api/inventory/check - Check availability
 */
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { inventoryId, date, quantity = 1 } = req.body;

    if (!inventoryId || !date) {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Missing required fields',
        'inventoryId and date are required'
      ));
    }

    if (!isDatabaseConnected()) {
      // Mock availability check
      return res.status(200).json(createResponse(true, {
        available: true,
        inventoryId,
        date,
        requestedQuantity: quantity,
        availableQuantity: 10,
        status: 'available',
      }));
    }

    // Check daily inventory first
    const dailyResult = await query(
      `SELECT * FROM inventory_daily WHERE inventory_id = $1 AND date = $2`,
      [inventoryId, date]
    );

    if (dailyResult.rows.length > 0) {
      const daily = dailyResult.rows[0] as Record<string, unknown>;
      const available = (daily.available_quantity as number) >= quantity;
      
      return res.status(200).json(createResponse(true, {
        available,
        inventoryId,
        date,
        requestedQuantity: quantity,
        availableQuantity: daily.available_quantity,
        status: daily.status,
        priceOverride: daily.price_override,
      }));
    }

    // Fall back to main inventory
    const invResult = await query(
      'SELECT * FROM inventory WHERE id = $1',
      [inventoryId]
    );

    if (invResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Inventory not found'));
    }

    const inv = invResult.rows[0] as Record<string, unknown>;
    const available = (inv.available_quantity as number) >= quantity;

    res.status(200).json(createResponse(true, {
      available,
      inventoryId,
      date,
      requestedQuantity: quantity,
      availableQuantity: inv.available_quantity,
      status: available ? 'available' : 'unavailable',
    }));
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to check availability'));
  }
});

/**
 * POST /api/inventory/check-availability - Bulk availability check
 */
router.post('/check-availability', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Missing items array'
      ));
    }

    const results = await Promise.all(
      items.map(async (item: { inventoryId: string; date: string; quantity?: number }) => {
        try {
          const { inventoryId, date, quantity = 1 } = item;
          
          const invResult = await query(
            `SELECT i.*, d.available_quantity as daily_available
             FROM inventory i
             LEFT JOIN inventory_daily d ON i.id = d.inventory_id AND d.date = $2
             WHERE i.id = $1`,
            [inventoryId, date]
          );

          if (invResult.rows.length === 0) {
            return { inventoryId, date, available: false, error: 'Not found' };
          }

          const inv = invResult.rows[0] as Record<string, unknown>;
          const availableQty = (inv.daily_available as number | undefined) ?? (inv.available_quantity as number);
          
          return {
            inventoryId,
            date,
            available: availableQty >= quantity,
            availableQuantity: availableQty,
            requestedQuantity: quantity,
          };
        } catch {
          return { inventoryId: item.inventoryId, date: item.date, available: false, error: 'Error' };
        }
      })
    );

    res.status(200).json(createResponse(true, { results }));
  } catch (error) {
    console.error('Error checking bulk availability:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to check availability'));
  }
});

// ==================== RESERVATIONS ====================

/**
 * POST /api/inventory/reserve - Reserve inventory
 */
router.post('/reserve', async (req: Request, res: Response) => {
  try {
    const {
      inventoryId,
      quantity = 1,
      startDate,
      endDate,
      bookingId,
      sessionId,
      expiresInMinutes = 15,
    } = req.body;

    if (!inventoryId || !startDate || !endDate) {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Missing required fields',
        'inventoryId, startDate, and endDate are required'
      ));
    }

    if (!isDatabaseConnected()) {
      // Mock reservation
      const mockReservation = {
        id: `res_${Date.now()}`,
        inventory_id: inventoryId,
        quantity,
        reservation_start: startDate,
        reservation_end: endDate,
        booking_id: bookingId,
        session_id: sessionId,
        status: 'pending',
        expires_at: new Date(Date.now() + expiresInMinutes * 60000).toISOString(),
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockReservation, 'Reservation created'));
    }

    // Use transaction for atomic reservation
    const result = await transaction(async (client) => {
      // Check availability
      const invCheck = await client.query(
        'SELECT * FROM inventory WHERE id = $1 FOR UPDATE',
        [inventoryId]
      );

      if (invCheck.rows.length === 0) {
        throw new Error('Inventory not found');
      }

      const inv = invCheck.rows[0];
      if (inv.available_quantity < quantity) {
        throw new Error('Insufficient availability');
      }

      // Update inventory
      await client.query(
        `UPDATE inventory 
         SET available_quantity = available_quantity - $1,
             reserved_quantity = reserved_quantity + $1
         WHERE id = $2`,
        [quantity, inventoryId]
      );

      // Create reservation
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);
      const resResult = await client.query(
        `INSERT INTO inventory_reservations (
          inventory_id, quantity, booking_id, session_id, 
          reservation_start, reservation_end, expires_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING *`,
        [inventoryId, quantity, bookingId, sessionId, startDate, endDate, expiresAt]
      );

      return resResult.rows[0];
    });

    res.status(201).json(createResponse(true, result, 'Inventory reserved'));
  } catch (error) {
    console.error('Error reserving inventory:', error);
    const message = error instanceof Error ? error.message : 'Failed to reserve inventory';
    res.status(400).json(createResponse(false, undefined, message));
  }
});

/**
 * POST /api/inventory/confirm - Confirm reservation (convert to booking)
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { reservationId, bookingId } = req.body;

    if (!reservationId) {
      return res.status(400).json(createResponse(false, undefined, 'Reservation ID required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { id: reservationId, status: 'confirmed' }, 'Reservation confirmed'));
    }

    const result = await transaction(async (client) => {
      // Get reservation
      const resCheck = await client.query(
        'SELECT * FROM inventory_reservations WHERE id = $1 FOR UPDATE',
        [reservationId]
      );

      if (resCheck.rows.length === 0) {
        throw new Error('Reservation not found');
      }

      const reservation = resCheck.rows[0];

      if (reservation.status !== 'pending') {
        throw new Error('Reservation is not pending');
      }

      // Update reservation status
      await client.query(
        `UPDATE inventory_reservations 
         SET status = 'confirmed', booking_id = $1, expires_at = NULL
         WHERE id = $2`,
        [bookingId, reservationId]
      );

      // Move from reserved to booked (update quantities)
      await client.query(
        `UPDATE inventory 
         SET reserved_quantity = reserved_quantity - $1
         WHERE id = $2`,
        [reservation.quantity, reservation.inventory_id]
      );

      return { ...reservation, status: 'confirmed', booking_id: bookingId };
    });

    res.status(200).json(createResponse(true, result, 'Reservation confirmed'));
  } catch (error) {
    console.error('Error confirming reservation:', error);
    const message = error instanceof Error ? error.message : 'Failed to confirm reservation';
    res.status(400).json(createResponse(false, undefined, message));
  }
});

/**
 * POST /api/inventory/release - Release/cancel reservation
 */
router.post('/release', async (req: Request, res: Response) => {
  try {
    const { reservationId, reason } = req.body;

    if (!reservationId) {
      return res.status(400).json(createResponse(false, undefined, 'Reservation ID required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { id: reservationId, status: 'released' }, 'Reservation released'));
    }

    const result = await transaction(async (client) => {
      // Get reservation
      const resCheck = await client.query(
        'SELECT * FROM inventory_reservations WHERE id = $1 FOR UPDATE',
        [reservationId]
      );

      if (resCheck.rows.length === 0) {
        throw new Error('Reservation not found');
      }

      const reservation = resCheck.rows[0];

      if (reservation.status === 'cancelled' || reservation.status === 'released') {
        throw new Error('Reservation already cancelled/released');
      }

      // Update reservation
      await client.query(
        `UPDATE inventory_reservations 
         SET status = 'released', notes = COALESCE(notes || ' | ', '') || $1
         WHERE id = $2`,
        [reason || 'Released', reservationId]
      );

      // Return inventory
      await client.query(
        `UPDATE inventory 
         SET available_quantity = available_quantity + $1,
             reserved_quantity = reserved_quantity - $1
         WHERE id = $2`,
        [reservation.quantity, reservation.inventory_id]
      );

      return { ...reservation, status: 'released' };
    });

    res.status(200).json(createResponse(true, result, 'Reservation released'));
  } catch (error) {
    console.error('Error releasing reservation:', error);
    const message = error instanceof Error ? error.message : 'Failed to release reservation';
    res.status(400).json(createResponse(false, undefined, message));
  }
});

/**
 * GET /api/inventory/reservations - Get reservations
 */
router.get('/reservations/all', async (req: Request, res: Response) => {
  try {
    const { inventoryId, bookingId, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { reservations: [], total: 0 }));
    }

    let sql = `SELECT r.*, i.name as inventory_name, i.product_type 
               FROM inventory_reservations r
               LEFT JOIN inventory i ON r.inventory_id = i.id
               WHERE 1=1`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (inventoryId) {
      sql += ` AND r.inventory_id = $${paramIndex++}`;
      params.push(inventoryId);
    }
    if (bookingId) {
      sql += ` AND r.booking_id = $${paramIndex++}`;
      params.push(bookingId);
    }
    if (status) {
      sql += ` AND r.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      reservations: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch reservations'));
  }
});

// ==================== CALENDAR ====================

/**
 * GET /api/inventory/calendar/:inventoryId - Get availability calendar
 */
router.get('/calendar/:inventoryId', async (req: Request, res: Response) => {
  try {
    const { inventoryId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json(createResponse(false, undefined, 'startDate and endDate are required'));
    }

    if (!isDatabaseConnected()) {
      // Generate mock calendar data
      const mockCalendar = [];
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        mockCalendar.push({
          date: d.toISOString().split('T')[0],
          available: Math.floor(Math.random() * 10) + 1,
          reserved: Math.floor(Math.random() * 5),
          blocked: Math.random() > 0.8 ? 1 : 0,
          status: 'available',
        });
      }
      
      return res.status(200).json(createResponse(true, mockCalendar));
    }

    const result = await query(
      `SELECT date, available_quantity, reserved_quantity, blocked_quantity, status, price_override
       FROM inventory_daily
       WHERE inventory_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date`,
      [inventoryId, startDate, endDate]
    );

    res.status(200).json(createResponse(true, result.rows));
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch calendar'));
  }
});

/**
 * POST /api/inventory/calendar/:inventoryId - Update calendar entry
 */
router.post('/calendar/:inventoryId', async (req: Request, res: Response) => {
  try {
    const { inventoryId } = req.params;
    const { date, availableQuantity, blockedQuantity, priceOverride, status } = req.body;

    if (!date) {
      return res.status(400).json(createResponse(false, undefined, 'date is required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        inventory_id: inventoryId,
        date,
        available_quantity: availableQuantity,
        status,
      }, 'Calendar entry updated'));
    }

    // Upsert calendar entry
    const result = await query(
      `INSERT INTO inventory_daily (inventory_id, date, available_quantity, blocked_quantity, price_override, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (inventory_id, date)
       DO UPDATE SET 
         available_quantity = COALESCE($3, inventory_daily.available_quantity),
         blocked_quantity = COALESCE($4, inventory_daily.blocked_quantity),
         price_override = COALESCE($5, inventory_daily.price_override),
         status = COALESCE($6, inventory_daily.status)
       RETURNING *`,
      [inventoryId, date, availableQuantity, blockedQuantity, priceOverride, status || 'available']
    );

    res.status(200).json(createResponse(true, result.rows[0], 'Calendar entry updated'));
  } catch (error) {
    console.error('Error updating calendar:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update calendar'));
  }
});

// ==================== BLOCKS ====================

/**
 * POST /api/inventory/blocks - Create inventory block
 */
router.post('/blocks', async (req: Request, res: Response) => {
  try {
    const { inventoryId, startDate, endDate, quantity = 1, reason, blockType = 'maintenance' } = req.body;

    if (!inventoryId || !startDate || !endDate) {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Missing required fields'
      ));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `block_${Date.now()}`,
        inventory_id: inventoryId,
        start_date: startDate,
        end_date: endDate,
        quantity,
        reason,
        block_type: blockType,
        is_active: true,
      }, 'Block created'));
    }

    const id = `block_${Date.now()}`;
    
    const result = await transaction(async (client) => {
      // Create block
      const blockResult = await client.query(
        `INSERT INTO inventory_blocks (id, inventory_id, start_date, end_date, quantity, reason, block_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id, inventoryId, startDate, endDate, quantity, reason, blockType]
      );

      // Update blocked quantities for each date in range
      await client.query(
        `INSERT INTO inventory_daily (inventory_id, date, blocked_quantity, status)
         SELECT $1, d::date, $2, 'blocked'
         FROM generate_series($3::date, $4::date, '1 day'::interval) d
         ON CONFLICT (inventory_id, date)
         DO UPDATE SET blocked_quantity = inventory_daily.blocked_quantity + $2`,
        [inventoryId, quantity, startDate, endDate]
      );

      return blockResult.rows[0];
    });

    res.status(201).json(createResponse(true, result, 'Block created'));
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create block'));
  }
});

/**
 * DELETE /api/inventory/blocks/:id - Remove inventory block
 */
router.delete('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Block removed'));
    }

    await transaction(async (client) => {
      // Get block
      const blockResult = await client.query(
        'SELECT * FROM inventory_blocks WHERE id = $1',
        [id]
      );

      if (blockResult.rows.length === 0) {
        throw new Error('Block not found');
      }

      const block = blockResult.rows[0];

      // Remove blocked quantities
      await client.query(
        `UPDATE inventory_daily
         SET blocked_quantity = GREATEST(0, blocked_quantity - $1)
         WHERE inventory_id = $2 AND date >= $3 AND date <= $4`,
        [block.quantity, block.inventory_id, block.start_date, block.end_date]
      );

      // Deactivate block
      await client.query(
        'UPDATE inventory_blocks SET is_active = FALSE WHERE id = $1',
        [id]
      );
    });

    res.status(200).json(createResponse(true, undefined, 'Block removed'));
  } catch (error) {
    console.error('Error removing block:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to remove block'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/inventory/stats - Get inventory statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        totalItems: 0,
        totalCapacity: 0,
        availableCapacity: 0,
        utilizationRate: 0,
        byType: {},
      }));
    }

    let whereClause = '';
    const params: unknown[] = [];
    
    if (supplierId) {
      whereClause = 'WHERE supplier_id = $1';
      params.push(supplierId);
    }

    const [totals, byType, lowStock] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_items,
          SUM(total_quantity) as total_capacity,
          SUM(available_quantity) as available_capacity,
          SUM(reserved_quantity) as reserved_capacity
        FROM inventory ${whereClause}
      `, params),
      query(`
        SELECT product_type, COUNT(*) as count, SUM(total_quantity) as capacity
        FROM inventory ${whereClause}
        GROUP BY product_type
      `, params),
      query(`
        SELECT COUNT(*) as count FROM inventory ${whereClause}
        AND available_quantity < total_quantity * 0.2
      `, params),
    ]);

    const totalsRow = totals.rows[0] as Record<string, unknown> | undefined;
    const totalCapacity = parseInt((totalsRow?.total_capacity as string) || '0');
    const availableCapacity = parseInt((totalsRow?.available_capacity as string) || '0');

    res.status(200).json(createResponse(true, {
      totalItems: parseInt((totalsRow?.total_items as string) || '0'),
      totalCapacity,
      availableCapacity,
      reservedCapacity: parseInt((totalsRow?.reserved_capacity as string) || '0'),
      utilizationRate: totalCapacity > 0 
        ? Math.round(((totalCapacity - availableCapacity) / totalCapacity) * 100) 
        : 0,
      byType: byType.rows.reduce((acc: Record<string, unknown>, row: Record<string, unknown>) => {
        acc[row.product_type as string] = {
          count: parseInt(row.count as string),
          capacity: parseInt(row.capacity as string),
        };
        return acc;
      }, {}),
      lowStockItems: parseInt(((lowStock.rows[0] as Record<string, unknown> | undefined)?.count as string) || '0'),
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

export default router;
