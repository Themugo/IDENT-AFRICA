/**
 * Payment Service Layer
 * 
 * Unified payment interface supporting multiple providers:
 * - M-Pesa (Kenya)
 * - Flutterwave (Africa)
 * - Stripe (International)
 */

// Payment types
export type PaymentProvider = 'mpesa' | 'flutterwave' | 'stripe' | 'paypal' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'KES' | 'TZS' | 'UGX' | 'NGN' | 'GHS' | 'ZAR';

export interface PaymentRequest {
  bookingId: string;
  userId?: string;
  amount: number;
  currency: Currency;
  provider: PaymentProvider;
  phoneNumber?: string;
  email?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionReference?: string;
  providerTransactionId?: string;
  status: PaymentStatus;
  message?: string;
  data?: Record<string, unknown>;
  redirectUrl?: string;
}

export interface PaymentVerification {
  isValid: boolean;
  transactionReference?: string;
  amount?: number;
  status?: PaymentStatus;
  message?: string;
  providerData?: Record<string, unknown>;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: 'customer_request' | 'duplicate' | 'fraudulent' | 'service_issue' | 'cancellation' | 'other';
  description?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  status: PaymentStatus;
  message?: string;
}

// Provider interface
export interface PaymentProviderAdapter {
  readonly name: PaymentProvider;
  readonly supportedCurrencies: Currency[];
  readonly supportedMethods: string[];
  
  initialize(): Promise<void>;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(transactionReference: string): Promise<PaymentVerification>;
  handleCallback(data: Record<string, unknown>): Promise<PaymentResult>;
  createRefund(request: RefundRequest): Promise<RefundResult>;
  getTransactionStatus(transactionReference: string): Promise<PaymentResult>;
}

// Re-export providers
export { MpesaProvider } from './providers/mpesa';
export { FlutterwaveProvider } from './providers/flutterwave';
export { StripeProvider } from './providers/stripe';
