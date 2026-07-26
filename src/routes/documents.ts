/**
 * Documents API Routes
 * Document generation, storage, and management
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

function generateDocumentNumber(type: string): string {
  const prefix = {
    booking_confirmation: 'BC',
    invoice: 'INV',
    safari_itinerary: 'IT',
    travel_checklist: 'TC',
    supplier_voucher: 'SV',
    travel_insurance: 'TI',
    visa_confirmation: 'VC',
    flight_ticket: 'FT',
    hotel_voucher: 'HV',
    other: 'DOC',
  }[type] || 'DOC';
  
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// ==================== DOCUMENTS ====================

/**
 * GET /api/documents - Get documents
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { bookingId, customerId, supplierId, type, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        documents: [
          {
            id: 'doc_1',
            document_type: 'booking_confirmation',
            document_number: 'BC-2024-001',
            title: 'Booking Confirmation - Safari Adventure',
            booking_id: 'book_001',
            customer_id: 'user_001',
            status: 'generated',
            download_count: 3,
            sent_via_email: true,
            generated_at: new Date().toISOString(),
          },
          {
            id: 'doc_2',
            document_type: 'safari_itinerary',
            document_number: 'IT-2024-001',
            title: 'Safari Itinerary - 5 Day Safari',
            booking_id: 'book_001',
            customer_id: 'user_001',
            status: 'sent',
            download_count: 1,
            sent_via_email: true,
            generated_at: new Date().toISOString(),
          },
          {
            id: 'doc_3',
            document_type: 'invoice',
            document_number: 'INV-2024-001',
            title: 'Invoice #INV-2024-001',
            booking_id: 'book_001',
            customer_id: 'user_001',
            status: 'viewed',
            download_count: 5,
            sent_via_email: true,
            generated_at: new Date().toISOString(),
          },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (bookingId) {
      sql += ` AND booking_id = $${paramIndex++}`;
      params.push(bookingId);
    }
    if (customerId) {
      sql += ` AND customer_id = $${paramIndex++}`;
      params.push(customerId);
    }
    if (supplierId) {
      sql += ` AND supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }
    if (type) {
      sql += ` AND document_type = $${paramIndex++}`;
      params.push(type);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      documents: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch documents'));
  }
});

/**
 * GET /api/documents/:id - Get document by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        id,
        document_type: 'booking_confirmation',
        document_number: 'BC-2024-001',
        title: 'Booking Confirmation',
        status: 'generated',
        content: { booking_number: 'BK-001', customer_name: 'John Doe' },
      }));
    }

    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Document not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch document'));
  }
});

/**
 * POST /api/documents/generate - Generate a new document
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      documentType,
      bookingId,
      customerId,
      supplierId,
      title,
      description,
      content,
      metadata,
      validFrom,
      validUntil,
      generatedBy = 'system',
    } = req.body;

    if (!documentType || !title || !content) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    const documentNumber = generateDocumentNumber(documentType);

    if (!isDatabaseConnected()) {
      const mockDocument = {
        id: `doc_${Date.now()}`,
        document_type: documentType,
        document_number: documentNumber,
        title,
        description,
        booking_id: bookingId,
        customer_id: customerId,
        supplier_id: supplierId,
        content,
        metadata,
        status: 'generated',
        download_count: 0,
        sent_via_email: false,
        generated_by: generatedBy,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      return res.status(201).json(createResponse(true, mockDocument, 'Document generated'));
    }

    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, title, description,
        booking_id, customer_id, supplier_id,
        content, metadata, status, valid_from, valid_until,
        generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'generated', $10, $11, $12, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        documentType, documentNumber, title, description,
        bookingId, customerId, supplierId,
        JSON.stringify(content), JSON.stringify(metadata || {}),
        validFrom, validUntil, generatedBy,
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Document generated'));
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to generate document'));
  }
});

/**
 * GET /api/documents/:id/download - Download document
 */
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!isDatabaseConnected()) {
      // Return mock PDF content
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="document.pdf"`);
      return res.send(Buffer.from('Mock PDF content'));
    }

    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Document not found'));
    }

    const doc = result.rows[0] as Record<string, unknown>;

    // Update download count
    await query(
      `UPDATE documents SET 
        download_count = download_count + 1,
        last_downloaded_at = CURRENT_TIMESTAMP,
        last_downloaded_by = $1,
        status = 'viewed'
       WHERE id = $2`,
      [userId || 'anonymous', id]
    );

    // Log access
    await query(
      `INSERT INTO document_access_log (
        document_id, accessed_by, accessed_by_type, access_type, ip_address, user_agent
      ) VALUES ($1, $2, $3, 'download', $4, $5)`,
      [id, userId || 'anonymous', 'customer', req.ip, req.get('user-agent')]
    );

    // In production, return actual file from file_path
    // For now, return the content as JSON
    res.status(200).json(createResponse(true, {
      documentId: id,
      content: doc.content,
      documentNumber: doc.document_number,
      fileName: `${doc.document_number}.pdf`,
    }));
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to download document'));
  }
});

/**
 * POST /api/documents/:id/send - Send document via email
 */
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, subject, message } = req.body;

    if (!email) {
      return res.status(400).json(createResponse(false, undefined, 'Email is required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Document sent via email'));
    }

    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Document not found'));
    }

    // Update sent status
    await query(
      `UPDATE documents SET 
        sent_via_email = TRUE,
        sent_at = CURRENT_TIMESTAMP,
        sent_to_email = $1,
        status = 'sent'
       WHERE id = $2`,
      [email, id]
    );

    // In production, integrate with email service
    // await emailService.send({ to: email, subject, documentId: id });

    res.status(200).json(createResponse(true, undefined, 'Document sent via email'));
  } catch (error) {
    console.error('Error sending document:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to send document'));
  }
});

/**
 * POST /api/documents/:id/share - Create share link
 */
router.post('/:id/share', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { validUntil, maxViews, allowedEmails, password } = req.body;

    if (!isDatabaseConnected()) {
      const token = `share_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return res.status(201).json(createResponse(true, {
        shareToken: token,
        shareUrl: `/documents/share/${token}`,
      }));
    }

    const token = `share_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await query(
      `INSERT INTO document_shares (
        document_id, share_token, share_url, allowed_emails,
        password_protected, password_hash, valid_until, max_views,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        id, token, `/documents/share/${token}`,
        JSON.stringify(allowedEmails || []),
        !!password, password ? `hash_${password}` : null,
        validUntil, maxViews, req.body.userId,
      ]
    );

    res.status(201).json(createResponse(true, {
      shareToken: token,
      shareUrl: (result.rows[0] as Record<string, unknown>).share_url,
    }));
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create share link'));
  }
});

/**
 * GET /api/documents/share/:token - Get document by share token
 */
router.get('/share/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        id: 'doc_shared',
        document_type: 'booking_confirmation',
        title: 'Shared Document',
        content: { sample: 'content' },
      }));
    }

    const shareResult = await query(
      'SELECT * FROM document_shares WHERE share_token = $1',
      [token]
    );

    if (shareResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Share link not found'));
    }

    const share = shareResult.rows[0] as Record<string, unknown>;

    // Check validity
    if (share.valid_until && new Date(share.valid_until as string) < new Date()) {
      return res.status(410).json(createResponse(false, undefined, 'Share link has expired'));
    }

    if ((share.max_views as number) && (share.view_count as number) >= (share.max_views as number)) {
      return res.status(410).json(createResponse(false, undefined, 'Share link view limit reached'));
    }

    // Get document
    const docResult = await query('SELECT * FROM documents WHERE id = $1', [share.document_id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Document not found'));
    }

    // Update view count
    await query('UPDATE document_shares SET view_count = view_count + 1 WHERE id = $1', [share.id]);

    res.status(200).json(createResponse(true, docResult.rows[0] as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching shared document:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch document'));
  }
});

/**
 * GET /api/documents/templates - Get document templates
 */
router.get('/templates/list', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        templates: [
          { id: 'tpl_1', name: 'Booking Confirmation', document_type: 'booking_confirmation', is_default: true },
          { id: 'tpl_2', name: 'Safari Itinerary', document_type: 'safari_itinerary', is_default: true },
          { id: 'tpl_3', name: 'Travel Checklist', document_type: 'travel_checklist', is_default: true },
          { id: 'tpl_4', name: 'Invoice', document_type: 'invoice', is_default: true },
          { id: 'tpl_5', name: 'Supplier Voucher', document_type: 'supplier_voucher', is_default: true },
        ],
      }));
    }

    let sql = 'SELECT * FROM document_templates WHERE is_active = TRUE';
    const params: unknown[] = [];

    if (type) {
      sql += ' AND document_type = $1';
      params.push(type);
    }

    sql += ' ORDER BY is_default DESC, name ASC';

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, { templates: result.rows }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch templates'));
  }
});

/**
 * GET /api/documents/:id/access-log - Get document access log
 */
router.get('/:id/access-log', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        logs: [
          { id: 'log_1', accessed_by: 'user_001', access_type: 'view', accessed_at: new Date().toISOString() },
          { id: 'log_2', accessed_by: 'user_001', access_type: 'download', accessed_at: new Date().toISOString() },
        ],
      }));
    }

    const result = await query(
      'SELECT * FROM document_access_log WHERE document_id = $1 ORDER BY accessed_at DESC',
      [id]
    );

    res.status(200).json(createResponse(true, { logs: result.rows }));
  } catch (error) {
    console.error('Error fetching access log:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch access log'));
  }
});

/**
 * GET /api/documents/stats - Get document statistics
 */
router.get('/stats/all', async (req: Request, res: Response) => {
  try {
    const { customerId, supplierId, startDate, endDate } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        totalDocuments: 24,
        byType: { booking_confirmation: 10, invoice: 5, safari_itinerary: 6, travel_checklist: 3 },
        byStatus: { generated: 15, sent: 6, viewed: 3 },
        totalDownloads: 45,
        totalSent: 20,
      }));
    }

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (customerId) {
      whereClause += ` AND customer_id = $${paramIndex++}`;
      params.push(customerId);
    }
    if (supplierId) {
      whereClause += ` AND supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }
    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    const [totals, byType, byStatus] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(download_count) as total_downloads,
          SUM(CASE WHEN sent_via_email THEN 1 ELSE 0 END) as total_sent
        FROM documents ${whereClause}
      `, params),
      query(`
        SELECT document_type, COUNT(*) as count
        FROM documents ${whereClause}
        GROUP BY document_type
      `, params),
      query(`
        SELECT status, COUNT(*) as count
        FROM documents ${whereClause}
        GROUP BY status
      `, params),
    ]);

    const totalsRow = totals.rows[0] as Record<string, unknown> || {};

    res.status(200).json(createResponse(true, {
      totalDocuments: parseInt(totalsRow.total as string || '0'),
      byType: byType.rows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
        acc[row.document_type as string] = parseInt(row.count as string);
        return acc;
      }, {}),
      byStatus: byStatus.rows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
        acc[row.status as string] = parseInt(row.count as string);
        return acc;
      }, {}),
      totalDownloads: parseInt(totalsRow.total_downloads as string || '0'),
      totalSent: parseInt(totalsRow.total_sent as string || '0'),
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

/**
 * DELETE /api/documents/:id - Delete document
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Document deleted'));
    }

    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Document not found'));
    }

    res.status(200).json(createResponse(true, undefined, 'Document deleted'));
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete document'));
  }
});

// ==================== QUICK GENERATION ENDPOINTS ====================

/**
 * POST /api/documents/generate/booking-confirmation - Generate booking confirmation
 */
router.post('/generate/booking-confirmation', async (req: Request, res: Response) => {
  try {
    const { bookingId, bookingData } = req.body;

    const document = {
      documentType: 'booking_confirmation',
      bookingId,
      customerId: bookingData.customerId,
      title: `Booking Confirmation - ${bookingData.bookingNumber || bookingId}`,
      content: {
        booking_number: bookingData.bookingNumber,
        confirmation_number: `CONF-${Date.now()}`,
        destination: bookingData.destination,
        travel_date: bookingData.travelDate,
        duration: bookingData.duration,
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone,
        package_details: bookingData.packageDetails,
        total_amount: bookingData.totalAmount,
        currency: bookingData.currency || 'USD',
        booking_date: new Date().toISOString(),
      },
      metadata: { generatedFor: 'customer', bookingReference: bookingId },
    };

    // Call the generate endpoint
    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, title, booking_id, customer_id,
        content, metadata, status, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'generated', 'system', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        document.documentType,
        `BC-${Date.now()}`,
        document.title,
        document.bookingId,
        document.customerId,
        JSON.stringify(document.content),
        JSON.stringify(document.metadata),
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Booking confirmation generated'));
  } catch (error) {
    console.error('Error generating booking confirmation:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to generate document'));
  }
});

/**
 * POST /api/documents/generate/safari-itinerary - Generate safari itinerary
 */
router.post('/generate/safari-itinerary', async (req: Request, res: Response) => {
  try {
    const { bookingId, itineraryData } = req.body;

    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, title, booking_id, customer_id, supplier_id,
        content, metadata, status, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'generated', 'system', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        'safari_itinerary',
        `IT-${Date.now()}`,
        `Safari Itinerary - ${bookingId}`,
        bookingId,
        itineraryData.customerId,
        itineraryData.supplierId,
        JSON.stringify(itineraryData),
        JSON.stringify({ generatedFor: 'customer', packageType: 'safari' }),
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Safari itinerary generated'));
  } catch (error) {
    console.error('Error generating safari itinerary:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to generate document'));
  }
});

/**
 * POST /api/documents/generate/travel-checklist - Generate travel checklist
 */
router.post('/generate/travel-checklist', async (req: Request, res: Response) => {
  try {
    const { bookingId, checklistData } = req.body;

    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, title, booking_id, customer_id,
        content, metadata, status, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'generated', 'system', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        'travel_checklist',
        `TC-${Date.now()}`,
        `Travel Checklist - ${bookingId}`,
        bookingId,
        checklistData.customerId,
        JSON.stringify(checklistData),
        JSON.stringify({ generatedFor: 'customer', checklistType: 'pre-travel' }),
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Travel checklist generated'));
  } catch (error) {
    console.error('Error generating travel checklist:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to generate document'));
  }
});

/**
 * POST /api/documents/generate/invoice - Generate invoice
 */
router.post('/generate/invoice', async (req: Request, res: Response) => {
  try {
    const { bookingId, invoiceData } = req.body;

    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, title, booking_id, customer_id,
        content, metadata, status, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'generated', 'system', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        'invoice',
        `INV-${Date.now()}`,
        `Invoice - ${invoiceData.invoiceNumber || bookingId}`,
        bookingId,
        invoiceData.customerId,
        JSON.stringify(invoiceData),
        JSON.stringify({ generatedFor: 'customer', invoiceType: 'booking' }),
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Invoice generated'));
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to generate document'));
  }
});

/**
 * POST /api/documents/generate/supplier-voucher - Generate supplier voucher
 */
router.post('/generate/supplier-voucher', async (req: Request, res: Response) => {
  try {
    const { bookingId, voucherData } = req.body;

    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, title, booking_id, supplier_id,
        content, metadata, status, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'generated', 'system', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        'supplier_voucher',
        `SV-${Date.now()}`,
        `Supplier Voucher - ${bookingId}`,
        bookingId,
        voucherData.supplierId,
        JSON.stringify(voucherData),
        JSON.stringify({ generatedFor: 'supplier', voucherType: 'service' }),
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Supplier voucher generated'));
  } catch (error) {
    console.error('Error generating supplier voucher:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to generate document'));
  }
});

export default router;
