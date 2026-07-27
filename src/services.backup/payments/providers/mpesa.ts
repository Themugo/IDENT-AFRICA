/**
 * M-Pesa Provider
 * 
 * Safaricom M-Pesa integration for Kenyan payments.
 * Supports STK Push for mobile payments.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  PaymentProviderAdapter,
  PaymentRequest,
  PaymentResult,
  PaymentVerification,
  PaymentStatus,
  RefundRequest,
  RefundResult,
  Currency,
} from '../index';

// M-Pesa API Configuration
interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

const config: MpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  shortCode: process.env.MPESA_SHORT_CODE || '174379',
  passkey: process.env.MPESA_PASSKEY || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://api.identafrica.com/webhooks/mpesa',
  environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
};

class MpesaProvider implements PaymentProviderAdapter {
  readonly name: PaymentProviderAdapter['name'] = 'mpesa';
  readonly supportedCurrencies: Currency[] = ['KES'];
  readonly supportedMethods = ['stk_push', 'b2c', 'c2b'];
  
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async initialize(): Promise<void> {
    console.log('M-Pesa provider initialized');
  }

  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // In production, fetch from Safaricom API
    // For now, return mock token
    if (!config.consumerKey || !config.consumerSecret) {
      console.warn('M-Pesa credentials not configured, using mock mode');
      this.accessToken = 'mock_token_' + Date.now();
      this.tokenExpiry = Date.now() + 3600000;
      return this.accessToken;
    }

    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    
    try {
      const response = await fetch(
        config.environment === 'sandbox'
          ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
          : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      
      return this.accessToken!;
    } catch (error) {
      console.error('Failed to get M-Pesa access token:', error);
      throw new Error('M-Pesa authentication failed');
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate phone number
      const phone = this.formatPhoneNumber(request.phoneNumber || '');
      if (!phone) {
        return {
          success: false,
          status: 'failed',
          message: 'Invalid phone number format',
        };
      }

      // Generate transaction reference
      const transactionRef = `MPX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const partyA = phone;
      const amount = Math.ceil(request.amount);

      // In production, call Safaricom STK Push API
      const token = await this.getAccessToken();
      
      if (token.startsWith('mock_token_')) {
        // Mock mode - simulate successful initiation
        console.log(`[MOCK] M-Pesa STK Push: ${transactionRef}, Phone: ${partyA}, Amount: ${amount}`);
        
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: transactionRef,
          status: 'processing',
          message: 'Payment request sent. Please check your phone to enter PIN.',
          data: {
            merchantRequestId: 'MERCHANT' + Date.now(),
            checkoutRequestId: 'CHECKOUT' + Date.now(),
            customerMessage: 'Simulated: Enter PIN on your phone',
          },
        };
      }

      const response = await fetch(
        config.environment === 'sandbox'
          ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
          : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: config.shortCode,
            Password: this.generatePassword(),
            Timestamp: this.generateTimestamp(),
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: partyA,
            PartyB: config.shortCode,
            PhoneNumber: partyA,
            CallBackURL: config.callbackUrl,
            AccountReference: request.bookingId,
            TransactionDesc: request.description || 'IDENT Africa Booking Payment',
          }),
        }
      );

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: transactionRef,
          providerTransactionId: data.CheckoutRequestID,
          status: 'processing',
          message: 'Payment request sent. Please check your phone.',
          data: {
            merchantRequestId: data.MerchantRequestID,
            checkoutRequestId: data.CheckoutRequestID,
            customerMessage: data.CustomerMessage,
          },
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: data.ResponseDescription || 'Payment initiation failed',
        };
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to initiate M-Pesa payment',
      };
    }
  }

  async verifyPayment(transactionReference: string): Promise<PaymentVerification> {
    try {
      const token = await this.getAccessToken();
      
      if (token.startsWith('mock_token_')) {
        return {
          isValid: true,
          transactionReference,
          amount: 0,
          status: 'completed',
          message: 'Mock payment verified',
        };
      }

      // Query STK Push status
      const response = await fetch(
        config.environment === 'sandbox'
          ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query'
          : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/query',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: config.shortCode,
            Password: this.generatePassword(),
            Timestamp: this.generateTimestamp(),
            CheckoutRequestID: transactionReference,
          }),
        }
      );

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          isValid: true,
          transactionReference,
          status: this.mapResultCode(data.ResultCode),
          message: data.ResultDesc,
        };
      } else {
        return {
          isValid: false,
          transactionReference,
          status: 'failed',
          message: data.ResultDesc,
        };
      }
    } catch (error) {
      console.error('M-Pesa verification error:', error);
      return {
        isValid: false,
        message: 'Verification failed',
      };
    }
  }

  async handleCallback(callbackData: Record<string, unknown>): Promise<PaymentResult> {
    try {
      const body = callbackData.Body as { stkCallback?: MpesaStkCallback };
      
      if (!body?.stkCallback) {
        return {
          success: false,
          status: 'failed',
          message: 'Invalid callback data',
        };
      }

      const callback = body.stkCallback;

      if (callback.ResultCode === 0) {
        // Payment successful
        const item = callback.CallbackMetadata?.Item?.[0];
        const amount = item?.Value;

        return {
          success: true,
          status: 'completed',
          transactionReference: callback.CheckoutRequestID,
          message: 'Payment successful',
          data: {
            amount,
            receiptNumber: callback.CallbackMetadata?.Item?.[1]?.Value,
            transactionId: callback.CallbackMetadata?.Item?.[2]?.Value,
            phoneNumber: callback.CallbackMetadata?.Item?.[4]?.Value,
          },
        };
      } else {
        // Payment failed
        return {
          success: false,
          status: 'failed',
          transactionReference: callback.CheckoutRequestID,
          message: callback.ResultDesc,
        };
      }
    } catch (error) {
      console.error('M-Pesa callback error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Callback processing failed',
      };
    }
  }

  async createRefund(request: RefundRequest): Promise<RefundResult> {
    // M-Pesa B2C for refunds
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        config.environment === 'sandbox'
          ? 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'
          : 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            InitiatorName: process.env.MPESA_INITIATOR_NAME || '',
            SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
            CommandID: 'SalaryPayment',
            Amount: request.amount,
            PartyA: config.shortCode,
            PartyB: request.paymentId, // Phone number or account
            Remarks: request.description || 'Refund',
            QueueTimeOutURL: `${config.callbackUrl}/timeout`,
            ResultURL: `${config.callbackUrl}/b2c`,
          }),
        }
      );

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          success: true,
          refundId: data.ConversationID,
          status: 'processing',
          message: 'Refund initiated',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: data.ResponseDescription,
        };
      }
    } catch (error) {
      console.error('M-Pesa refund error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Refund failed',
      };
    }
  }

  async getTransactionStatus(transactionReference: string): Promise<PaymentResult> {
    const verification = await this.verifyPayment(transactionReference);
    return {
      success: verification.isValid,
      transactionReference: verification.transactionReference,
      status: verification.status || 'failed',
      message: verification.message,
    };
  }

  private formatPhoneNumber(phone: string): string {
    // Remove spaces and special characters
    let formatted = phone.replace(/[\s\-()]/g, '');
    
    // Handle Kenyan numbers
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('+')) {
      formatted = formatted.slice(1);
    }
    
    // Validate format
    if (!/^254[1-9]\d{8}$/.test(formatted)) {
      return '';
    }
    
    return formatted;
  }

  private generatePassword(): string {
    const timestamp = this.generateTimestamp();
    const passkey = config.passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10ac78';
    return Buffer.from(config.shortCode + passkey + timestamp).toString('base64');
  }

  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  private mapResultCode(code: number): PaymentStatus {
    switch (code) {
      case 0: return 'completed';
      case 1: return 'failed'; // Insufficient
      case 17: return 'failed'; // Cancelled
      case 1036: return 'failed'; // Timeout
      default: return 'failed';
    }
  }
}

interface MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{ Name: string; Value: number | string }>;
  };
}

export { MpesaProvider };
