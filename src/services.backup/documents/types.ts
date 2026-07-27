/**
 * Document Types
 * 
 * Type definitions for document management system.
 */

// Document types
export type DocumentType = 
  | 'booking_confirmation'
  | 'invoice'
  | 'safari_itinerary'
  | 'travel_checklist'
  | 'supplier_voucher'
  | 'travel_insurance'
  | 'visa_confirmation'
  | 'flight_ticket'
  | 'hotel_voucher'
  | 'other';

// Document status
export type DocumentStatus = 'draft' | 'generated' | 'sent' | 'viewed' | 'expired';

// Document
export interface Document {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  description?: string;
  
  // Related entities
  bookingId?: string;
  customerId?: string;
  supplierId?: string;
  
  // File info
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType: string;
  
  // Content
  content: Record<string, unknown>;
  
  // Metadata
  metadata: Record<string, unknown>;
  
  // Status
  status: DocumentStatus;
  
  // Access tracking
  downloadCount: number;
  lastDownloadedAt?: string;
  lastDownloadedBy?: string;
  
  // Delivery
  sentViaEmail: boolean;
  sentAt?: string;
  sentToEmail?: string;
  
  // Validity
  validFrom?: string;
  validUntil?: string;
  
  // Generation
  generatedBy?: string;
  generatedAt: string;
  
  createdAt: string;
  updatedAt: string;
}

// Generate document request
export interface GenerateDocumentRequest {
  documentType: DocumentType;
  bookingId?: string;
  customerId?: string;
  supplierId?: string;
  title: string;
  description?: string;
  content: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  validFrom?: string;
  validUntil?: string;
  generatedBy?: string;
}

// Document template
export interface DocumentTemplate {
  id: string;
  name: string;
  documentType: DocumentType;
  description?: string;
  templateContent: string;
  styles?: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Document access log
export interface DocumentAccessLog {
  id: string;
  documentId: string;
  accessedBy: string;
  accessedByType?: 'customer' | 'supplier' | 'admin';
  accessType: 'view' | 'download' | 'email' | 'print';
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, unknown>;
  accessedAt: string;
}

// Document share
export interface DocumentShare {
  id: string;
  documentId: string;
  shareToken: string;
  shareUrl: string;
  allowedEmails?: string[];
  passwordProtected: boolean;
  validFrom?: string;
  validUntil?: string;
  maxViews?: number;
  viewCount: number;
  createdBy?: string;
  createdAt: string;
}

// Document statistics
export interface DocumentStats {
  totalDocuments: number;
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  totalDownloads: number;
  totalSent: number;
}

// Document type labels
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  booking_confirmation: 'Booking Confirmation',
  invoice: 'Invoice',
  safari_itinerary: 'Safari Itinerary',
  travel_checklist: 'Travel Checklist',
  supplier_voucher: 'Supplier Voucher',
  travel_insurance: 'Travel Insurance',
  visa_confirmation: 'Visa Confirmation',
  flight_ticket: 'Flight Ticket',
  hotel_voucher: 'Hotel Voucher',
  other: 'Other',
};

// Document type icons (emoji)
export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  booking_confirmation: '📋',
  invoice: '💰',
  safari_itinerary: '🗺️',
  travel_checklist: '✅',
  supplier_voucher: '🎫',
  travel_insurance: '🛡️',
  visa_confirmation: '📄',
  flight_ticket: '✈️',
  hotel_voucher: '🏨',
  other: '📎',
};
