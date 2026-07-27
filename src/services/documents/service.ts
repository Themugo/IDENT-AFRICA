/**
 * Document Service
 * 
 * Service for document generation and management.
 */

import type {
  Document,
  DocumentType,
  DocumentStatus,
  GenerateDocumentRequest,
  DocumentStats,
} from './types';

const API_BASE = '/api/documents';

/**
 * Document Service for managing travel documents
 */
class DocumentService {
  /**
   * Get documents
   */
  async getDocuments(options: {
    bookingId?: string;
    customerId?: string;
    supplierId?: string;
    type?: DocumentType;
    status?: DocumentStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ documents: Document[]; total: number }> {
    const params = new URLSearchParams();
    if (options.bookingId) params.set('bookingId', options.bookingId);
    if (options.customerId) params.set('customerId', options.customerId);
    if (options.supplierId) params.set('supplierId', options.supplierId);
    if (options.type) params.set('type', options.type);
    if (options.status) params.set('status', options.status);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`${API_BASE}?${params}`);
    const data = await res.json();
    
    return data.success ? data.data : { documents: [], total: 0 };
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Document | null> {
    const res = await fetch(`${API_BASE}/${documentId}`);
    const data = await res.json();
    
    return data.success ? data.data : null;
  }

  /**
   * Generate a new document
   */
  async generate(request: GenerateDocumentRequest): Promise<Document> {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate document');
    }

    return data.data;
  }

  /**
   * Download document
   */
  async download(documentId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/${documentId}/download`);
    
    if (!res.ok) {
      throw new Error('Failed to download document');
    }

    return res.blob();
  }

  /**
   * Get document download URL
   */
  getDownloadUrl(documentId: string): string {
    return `${API_BASE}/${documentId}/download`;
  }

  /**
   * Send document via email
   */
  async sendViaEmail(documentId: string, email: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${documentId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send document');
    }
  }

  /**
   * Create share link
   */
  async createShareLink(
    documentId: string,
    options: {
      validUntil?: string;
      maxViews?: number;
      allowedEmails?: string[];
      password?: string;
    } = {}
  ): Promise<{ shareUrl: string; shareToken: string }> {
    const res = await fetch(`${API_BASE}/${documentId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create share link');
    }

    return data.data;
  }

  /**
   * Get document by share token
   */
  async getByShareToken(token: string): Promise<Document | null> {
    const res = await fetch(`${API_BASE}/share/${token}`);
    const data = await res.json();
    
    return data.success ? data.data : null;
  }

  /**
   * Get document templates
   */
  async getTemplates(type?: DocumentType): Promise<unknown[]> {
    const params = type ? `?type=${type}` : '';
    const res = await fetch(`${API_BASE}/templates${params}`);
    const data = await res.json();
    
    return data.success ? data.data.templates : [];
  }

  /**
   * Get statistics
   */
  async getStats(options: {
    customerId?: string;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<DocumentStats> {
    const params = new URLSearchParams();
    if (options.customerId) params.set('customerId', options.customerId);
    if (options.supplierId) params.set('supplierId', options.supplierId);
    if (options.startDate) params.set('startDate', options.startDate);
    if (options.endDate) params.set('endDate', options.endDate);

    const res = await fetch(`${API_BASE}/stats?${params}`);
    const data = await res.json();
    
    return data.success ? data.data : {
      totalDocuments: 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalDownloads: 0,
      totalSent: 0,
    };
  }

  /**
   * Delete document
   */
  async delete(documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${documentId}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete document');
    }
  }

  /**
   * Get access log
   */
  async getAccessLog(documentId: string): Promise<unknown[]> {
    const res = await fetch(`${API_BASE}/${documentId}/access-log`);
    const data = await res.json();
    
    return data.success ? data.data.logs : [];
  }

  /**
   * Generate booking confirmation
   */
  async generateBookingConfirmation(bookingId: string, bookingData: Record<string, unknown>): Promise<Document> {
    return this.generate({
      documentType: 'booking_confirmation',
      bookingId,
      customerId: bookingData.customerId as string,
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
      metadata: {
        generatedFor: 'customer',
        bookingReference: bookingId,
      },
    });
  }

  /**
   * Generate invoice
   */
  async generateInvoice(bookingId: string, invoiceData: Record<string, unknown>): Promise<Document> {
    return this.generate({
      documentType: 'invoice',
      bookingId,
      customerId: invoiceData.customerId as string,
      title: `Invoice - ${invoiceData.invoiceNumber || bookingId}`,
      content: {
        invoice_number: invoiceData.invoiceNumber,
        booking_reference: bookingId,
        items: invoiceData.items || [],
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        currency: invoiceData.currency || 'USD',
        due_date: invoiceData.dueDate,
        payment_status: invoiceData.paymentStatus,
      },
      metadata: {
        generatedFor: 'customer',
        invoiceType: 'booking',
      },
    });
  }

  /**
   * Generate safari itinerary
   */
  async generateSafariItinerary(bookingId: string, itineraryData: Record<string, unknown>): Promise<Document> {
    return this.generate({
      documentType: 'safari_itinerary',
      bookingId,
      customerId: itineraryData.customerId as string,
      supplierId: itineraryData.supplierId as string,
      title: `Safari Itinerary - ${bookingId}`,
      content: {
        booking_number: bookingId,
        customer_name: itineraryData.customerName,
        destination: itineraryData.destination,
        duration: itineraryData.duration,
        itinerary_days: itineraryData.itineraryDays || [],
        emergency_contact: '+254 700 123 456',
        guide_contact: itineraryData.guideContact,
        meeting_point: itineraryData.meetingPoint,
      },
      metadata: {
        generatedFor: 'customer',
        packageType: 'safari',
      },
    });
  }

  /**
   * Generate travel checklist
   */
  async generateTravelChecklist(bookingId: string, checklistData: Record<string, unknown>): Promise<Document> {
    return this.generate({
      documentType: 'travel_checklist',
      bookingId,
      customerId: checklistData.customerId as string,
      title: `Travel Checklist - ${bookingId}`,
      content: {
        booking_number: bookingId,
        travel_date: checklistData.travelDate,
        destination: checklistData.destination,
        items: checklistData.items || [
          { category: 'Documents', items: ['Valid Passport', 'Visa', 'Booking Confirmation', 'Travel Insurance'] },
          { category: 'Essentials', items: ['Medications', 'Phone & Charger', 'Currency/Cards', 'Camera'] },
          { category: 'Clothing', items: ['Safari Clothing', 'Walking Shoes', 'Hat', 'Sunglasses'] },
        ],
      },
      metadata: {
        generatedFor: 'customer',
        checklistType: 'pre-travel',
      },
    });
  }

  /**
   * Generate supplier voucher
   */
  async generateSupplierVoucher(bookingId: string, voucherData: Record<string, unknown>): Promise<Document> {
    return this.generate({
      documentType: 'supplier_voucher',
      bookingId,
      supplierId: voucherData.supplierId as string,
      title: `Supplier Voucher - ${bookingId}`,
      content: {
        voucher_number: `VCH-${Date.now()}`,
        booking_reference: bookingId,
        supplier_name: voucherData.supplierName,
        service_details: voucherData.serviceDetails,
        booking_date: voucherData.bookingDate,
        guest_count: voucherData.guestCount,
        special_requirements: voucherData.specialRequirements,
        contact_person: voucherData.contactPerson,
      },
      metadata: {
        generatedFor: 'supplier',
        voucherType: 'service',
      },
    });
  }
}

export const documentService = new DocumentService();
