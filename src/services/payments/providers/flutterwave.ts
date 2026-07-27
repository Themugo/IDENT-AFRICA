/**
 * Flutterwave Provider
 * 
 * African payment gateway supporting:
 * - Cards (Visa, Mastercard)
 * - Mobile Money (M-Pesa, MTN, Airtel)
 * - Bank Transfer
 * - USSD
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

// Flutterwave API Configuration
interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  baseUrl: string;
  webhookSecret: string;
  currency: Currency;
}

const config: FlutterwaveConfig = {
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',
  baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
  webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
  currency: 'USD',
};

class FlutterwaveProvider implements PaymentProviderAdapter {
  readonly name: PaymentProviderAdapter['name'] = 'flutterwave';
  readonly supportedCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'KES', 'TZS', 'UGX', 'NGN'];
  readonly supportedMethods = ['card', 'mobile_money', 'bank_transfer', 'ussd'];

  async initialize(): Promise<void> {
    console.log('Flutterwave provider initialized');
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const txRef = `FLW${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // In production, call Flutterwave API
      if (!config.secretKey) {
        console.log(`[MOCK] Flutterwave Payment: ${txRef}, Amount: ${request.amount} ${request.currency}`);
        
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: txRef,
          status: 'processing',
          message: 'Payment link generated',
          redirectUrl: `https://flutterwave.com/pay/${txRef}`,
          data: {
            link: `https://flutterwave.com/pay/${txRef}`,
          },
        };
      }

      const response = await fetch(`${config.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: request.amount,
          currency: request.currency,
          redirect_url: `${process.env.APP_URL}/payment/callback/flutterwave`,
          customer: {
            email: request.email || 'customer@email.com',
            phonenumber: request.phoneNumber || '',
            name: request.userId || 'Customer',
          },
          customizations: {
            title: 'IDENT Africa Safari Booking',
            description: request.description || 'Safari booking payment',
            logo: process.env.APP_LOGO_URL || '',
          },
          meta: {
            booking_id: request.bookingId,
            ...request.metadata,
          },
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: txRef,
          providerTransactionId: data.data.id.toString(),
          status: 'processing',
          message: 'Payment initiated',
          redirectUrl: data.data.link,
          data: {
            link: data.data.link,
            paymentOptions: data.data.payment_options,
          },
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: data.message || 'Payment initiation failed',
        };
      }
    } catch (error) {
      console.error('Flutterwave payment error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to initiate Flutterwave payment',
      };
    }
  }

  async verifyPayment(transactionReference: string): Promise<PaymentVerification> {
    try {
      if (!config.secretKey) {
        return {
          isValid: true,
          transactionReference,
          status: 'completed',
          message: 'Mock verification successful',
        };
      }

      const response = await fetch(
        `${config.baseUrl}/transactions/${transactionReference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        const tx = data.data;
        return {
          isValid: true,
          transactionReference: tx.tx_ref,
          amount: tx.amount,
          status: this.mapStatus(tx.status),
          message: tx.status === 'successful' ? 'Payment successful' : tx.status,
          providerData: tx,
        };
      } else {
        return {
          isValid: false,
          transactionReference,
          status: 'failed',
          message: data.message,
        };
      }
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      return {
        isValid: false,
        message: 'Verification failed',
      };
    }
  }

  async handleCallback(callbackData: Record<string, unknown>): Promise<PaymentResult> {
    try {
      const { status, tx_ref, amount, currency, customer, id } = callbackData as {
        status?: string;
        tx_ref?: string;
        amount?: number;
        currency?: string;
        customer?: { email?: string };
        id?: number;
      };

      // Verify webhook signature
      // const signature = req.headers['verif-hash'];
      // if (signature !== config.webhookSecret) {
      //   return { success: false, status: 'failed', message: 'Invalid signature' };
      // }

      if (status === 'successful') {
        return {
          success: true,
          status: 'completed',
          transactionReference: tx_ref,
          providerTransactionId: id?.toString(),
          message: 'Payment successful',
          data: { amount, currency, customer },
        };
      } else if (status === 'pending') {
        return {
          success: true,
          status: 'processing',
          transactionReference: tx_ref,
          message: 'Payment pending',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          transactionReference: tx_ref,
          message: status || 'Payment failed',
        };
      }
    } catch (error) {
      console.error('Flutterwave callback error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Callback processing failed',
      };
    }
  }

  async createRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      if (!config.secretKey) {
        return {
          success: true,
          refundId: `REF${Date.now()}`,
          status: 'completed',
          message: 'Mock refund processed',
        };
      }

      const response = await fetch(`${config.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: request.paymentId,
          amount: request.amount,
          comment: request.description || 'Customer refund',
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          refundId: data.data.id.toString(),
          status: 'completed',
          message: 'Refund processed',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: data.message,
        };
      }
    } catch (error) {
      console.error('Flutterwave refund error:', error);
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
      data: verification.providerData,
    };
  }

  private mapStatus(status: string): PaymentStatus {
    switch (status.toLowerCase()) {
      case 'successful':
        return 'completed';
      case 'pending':
        return 'processing';
      case 'failed':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  // Mobile Money specific methods
  async initiateMobileMoney(
    request: PaymentRequest,
    mobileMoneyNetwork: 'mtn' | 'airtel' | 'vodafone'
  ): Promise<PaymentResult> {
    try {
      const txRef = `FLW${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      if (!config.secretKey) {
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: txRef,
          status: 'processing',
          message: `${mobileMoneyNetwork.toUpperCase()} payment initiated`,
        };
      }

      const response = await fetch(`${config.baseUrl}/mobile-money/${mobileMoneyNetwork}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: request.amount,
          currency: request.currency,
          email: request.email,
          phone_number: request.phoneNumber,
          network: mobileMoneyNetwork,
          redirect_url: `${process.env.APP_URL}/payment/callback/flutterwave`,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: txRef,
          status: 'processing',
          message: 'Mobile money payment initiated',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: data.message,
        };
      }
    } catch (error) {
      console.error('Flutterwave mobile money error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to initiate mobile money payment',
      };
    }
  }
}

export { FlutterwaveProvider };
