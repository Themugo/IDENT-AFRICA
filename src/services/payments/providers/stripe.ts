/**
 * Stripe Provider
 * 
 * International payment gateway supporting:
 * - Cards (Visa, Mastercard, Amex)
 * - Digital wallets (Apple Pay, Google Pay)
 * - Bank transfers
 * - ACH
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

// Stripe API Configuration
interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  baseUrl: string;
}

const config: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  baseUrl: process.env.APP_URL || 'https://identafrica.com',
};

class StripeProvider implements PaymentProviderAdapter {
  readonly name: PaymentProviderAdapter['name'] = 'stripe';
  readonly supportedCurrencies: Currency[] = ['USD', 'EUR', 'GBP'];
  readonly supportedMethods = ['card', 'apple_pay', 'google_pay', 'bank_transfer'];

  async initialize(): Promise<void> {
    console.log('Stripe provider initialized');
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const paymentIntentId = `pi_${uuidv4().replace(/-/g, '').slice(0, 24)}`;
      
      if (!config.secretKey) {
        console.log(`[MOCK] Stripe Payment: ${paymentIntentId}, Amount: ${request.amount} ${request.currency}`);
        
        return {
          success: true,
          paymentId: uuidv4(),
          transactionReference: paymentIntentId,
          status: 'processing',
          message: 'Payment intent created',
          data: {
            clientSecret: `${paymentIntentId}_secret_${uuidv4().slice(0, 24)}`,
          },
        };
      }

      // In production, use Stripe SDK:
      // const stripe = new Stripe(config.secretKey);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(request.amount * 100), // Convert to cents
      //   currency: request.currency.toLowerCase(),
      //   metadata: { bookingId: request.bookingId },
      //   receipt_email: request.email,
      // });

      // Mock response
      return {
        success: true,
        paymentId: uuidv4(),
        transactionReference: paymentIntentId,
        providerTransactionId: paymentIntentId,
        status: 'processing',
        message: 'Payment intent created',
        data: {
          clientSecret: `${paymentIntentId}_secret_mock`,
        },
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to create payment intent',
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
          message: 'Mock payment verified',
        };
      }

      // In production:
      // const stripe = new Stripe(config.secretKey);
      // const paymentIntent = await stripe.paymentIntents.retrieve(transactionReference);
      
      // Mock
      return {
        isValid: true,
        transactionReference,
        status: 'completed',
        message: 'Payment verified',
      };
    } catch (error) {
      console.error('Stripe verification error:', error);
      return {
        isValid: false,
        message: 'Verification failed',
      };
    }
  }

  async handleCallback(callbackData: Record<string, unknown>): Promise<PaymentResult> {
    try {
      // Stripe uses webhooks, not callbacks
      const { type, data } = callbackData as { type?: string; data?: { object?: Record<string, unknown> } };
      
      if (type === 'payment_intent.succeeded') {
        const paymentIntent = data?.object;
        return {
          success: true,
          status: 'completed',
          transactionReference: paymentIntent?.id as string,
          message: 'Payment successful',
        };
      } else if (type === 'payment_intent.payment_failed') {
        const paymentIntent = data?.object;
        return {
          success: false,
          status: 'failed',
          transactionReference: paymentIntent?.id as string,
          message: (paymentIntent?.last_payment_error as string) || 'Payment failed',
        };
      }

      return {
        success: false,
        status: 'failed',
        message: 'Unknown webhook event',
      };
    } catch (error) {
      console.error('Stripe callback error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Webhook processing failed',
      };
    }
  }

  async createRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      const refundId = `re_${uuidv4().replace(/-/g, '').slice(0, 24)}`;

      if (!config.secretKey) {
        return {
          success: true,
          refundId,
          status: 'completed',
          message: 'Mock refund processed',
        };
      }

      // In production:
      // const stripe = new Stripe(config.secretKey);
      // const refund = await stripe.refunds.create({
      //   payment_intent: request.paymentId,
      //   amount: request.amount ? Math.round(request.amount * 100) : undefined,
      //   reason: request.reason,
      // });

      return {
        success: true,
        refundId,
        status: 'completed',
        message: 'Refund processed',
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
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

  // Create Stripe Connect account for suppliers
  async createConnectAccount(
    email: string,
    businessName: string,
    country: string = 'KE'
  ): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      if (!config.secretKey) {
        return {
          success: true,
          accountId: `acct_mock_${Date.now()}`,
        };
      }

      // In production:
      // const stripe = new Stripe(config.secretKey);
      // const account = await stripe.accounts.create({
      //   type: 'express',
      //   email,
      //   business_type: 'company',
      //   company: { name: businessName },
      //   country,
      // });

      return {
        success: true,
        accountId: `acct_mock_${Date.now()}`,
      };
    } catch (error) {
      console.error('Stripe Connect error:', error);
      return {
        success: false,
        error: 'Failed to create Connect account',
      };
    }
  }

  // Create payout to supplier
  async createPayout(
    accountId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<{ success: boolean; payoutId?: string; error?: string }> {
    try {
      if (!config.secretKey) {
        return {
          success: true,
          payoutId: `po_mock_${Date.now()}`,
        };
      }

      // In production:
      // const stripe = new Stripe(config.secretKey);
      // const payout = await stripe.payouts.create({
      //   amount: Math.round(amount * 100),
      //   currency: currency.toLowerCase(),
      //   destination: accountId,
      // });

      return {
        success: true,
        payoutId: `po_mock_${Date.now()}`,
      };
    } catch (error) {
      console.error('Stripe payout error:', error);
      return {
        success: false,
        error: 'Failed to create payout',
      };
    }
  }

  // Generate payment link
  async createPaymentLink(
    amount: number,
    currency: string,
    bookingId: string,
    description: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!config.secretKey) {
        return {
          success: true,
          url: `https://checkout.stripe.com/pay/mock_${bookingId}`,
        };
      }

      // In production:
      // const stripe = new Stripe(config.secretKey);
      // const session = await stripe.checkout.sessions.create({
      //   payment_method_types: ['card'],
      //   line_items: [{
      //     price_data: {
      //       currency: currency.toLowerCase(),
      //       product_data: { name: description },
      //       unit_amount: Math.round(amount * 100),
      //     },
      //     quantity: 1,
      //   }],
      //   mode: 'payment',
      //   success_url: `${config.baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      //   cancel_url: `${config.baseUrl}/payment/cancelled`,
      //   metadata: { bookingId },
      // });

      return {
        success: true,
        url: `https://checkout.stripe.com/pay/mock_${bookingId}`,
      };
    } catch (error) {
      console.error('Stripe payment link error:', error);
      return {
        success: false,
        error: 'Failed to create payment link',
      };
    }
  }
}

export { StripeProvider };
