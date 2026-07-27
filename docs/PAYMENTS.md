# IDENT AFRICA Payment System Documentation

## Overview

IDENT AFRICA uses a unified payment architecture supporting multiple providers:

- **M-Pesa** - Kenya mobile payments
- **Flutterwave** - African payment gateway
- **Stripe** - International payments

---

## Payment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BOOKING                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT SERVICE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   M-Pesa    │  │ Flutterwave │  │   Stripe    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         ┌─────────┐    ┌─────────┐     ┌─────────┐
         │Customer │    │Supplier │     │Platform │
         │Payment  │    │Payout   │     │Commission│
         └─────────┘    └─────────┘     └─────────┘
```

---

## Payment Flow

### Customer Payment Flow

```
1. Customer selects booking
       │
       ▼
2. Choose payment method (M-Pesa, Card, etc.)
       │
       ▼
3. Payment Service creates payment record
       │
       ▼
4. Provider-specific payment initiated
   - M-Pesa: STK Push sent to phone
   - Card: Redirect to checkout
       │
       ▼
5. Customer completes payment on their device
       │
       ▼
6. Provider sends callback/webhook
       │
       ▼
7. Payment verified and status updated
       │
       ▼
8. Booking confirmed
       │
       ▼
9. Commission calculated
       │
       ▼
10. Receipt generated
```

---

## Supported Payment Methods

### M-Pesa (Kenya)

**Requirements:**
- Kenyan phone number
- M-Pesa account with sufficient funds

**Features:**
- STK Push (instant payment prompt)
- Real-time confirmation
- Low transaction fees

**Setup:**
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://api.identafrica.com/webhooks/mpesa
MPESA_ENVIRONMENT=sandbox  # or production
```

### Flutterwave (Africa)

**Supported Countries:**
- Nigeria (NGN)
- Kenya (KES)
- Uganda (UGX)
- Tanzania (TZS)
- Ghana (GHS)
- South Africa (ZAR)
- UK (GBP, USD)
- US (USD)

**Payment Types:**
- Cards (Visa, Mastercard)
- Mobile Money (MTN, Airtel, Vodafone)
- Bank Transfer
- USSD

**Setup:**
```env
FLUTTERWAVE_PUBLIC_KEY=your_public_key
FLUTTERWAVE_SECRET_KEY=your_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3
```

### Stripe (International)

**Supported:**
- Cards (Visa, Mastercard, Amex)
- Apple Pay / Google Pay
- Bank transfers (ACH)

**Setup:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Commission Structure

### Default Commission

| Booking Amount | Commission Rate | IDENT AFRICA | Supplier |
|---------------|----------------|--------------|----------|
| $1,000        | 15%            | $150         | $850     |

### Commission Breakdown

- **Platform Fee**: 70% of commission ($105)
- **Processing Fee**: 30% of commission ($45)

### Custom Commissions

Suppliers can negotiate different rates based on:
- Volume commitments
- Partnership tier
- Product type

---

## Database Tables

### payments

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | Related booking |
| provider | VARCHAR | mpesa, flutterwave, stripe |
| transaction_reference | VARCHAR | Unique reference |
| amount | DECIMAL | Payment amount |
| currency | VARCHAR | USD, KES, etc. |
| payment_status | VARCHAR | pending, completed, failed |
| gateway_response | JSONB | Provider response |
| created_at | TIMESTAMP | Creation time |

### transactions

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| payment_id | UUID | Related payment |
| supplier_id | UUID | Related supplier |
| type | VARCHAR | payment, commission, refund, payout |
| amount | DECIMAL | Transaction amount |
| status | VARCHAR | completed, pending, failed |

### supplier_payouts

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| supplier_id | UUID | Supplier reference |
| gross_amount | DECIMAL | Total booking value |
| commission_rate | DECIMAL | Applied commission % |
| commission_amount | DECIMAL | Commission deducted |
| net_amount | DECIMAL | Payout amount |
| status | VARCHAR | pending, processing, paid |
| paid_at | TIMESTAMP | Payment timestamp |

---

## API Endpoints

### Create Payment

```http
POST /api/payments/create
Content-Type: application/json

{
  "bookingId": "uuid",
  "amount": 1000,
  "currency": "USD",
  "provider": "mpesa",
  "phoneNumber": "+254700000000",
  "email": "customer@email.com"
}
```

### Verify Payment

```http
GET /api/payments/verify/:provider/:reference
```

### Process Refund

```http
POST /api/payments/refund
Content-Type: application/json

{
  "paymentId": "uuid",
  "amount": 500,
  "reason": "customer_request",
  "description": "Customer requested cancellation"
}
```

### Get Provider Status

```http
GET /api/payments/providers/status
```

---

## Webhooks

### M-Pesa Callback

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "...",
      "CheckoutRequestID": "...",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 1000},
          {"Name": "MpesaReceiptNumber", "Value": "..."},
          {"Name": "TransactionDate", "Value": "..."},
          {"Name": "PhoneNumber", "Value": "..."}
        ]
      }
    }
  }
}
```

### Flutterwave Webhook

```json
{
  "event": "charge.completed",
  "data": {
    "id": 12345,
    "tx_ref": "...",
    "amount": 1000,
    "currency": "USD",
    "status": "successful",
    "customer": {
      "email": "customer@email.com"
    }
  }
}
```

### Stripe Webhook

```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "amount": 100000,
      "currency": "usd"
    }
  }
}
```

---

## Security

### Callback Verification

All webhooks must be verified:

1. **M-Pesa**: Verify callback origin and signature
2. **Flutterwave**: Verify `verif-hash` header
3. **Stripe**: Verify signature using webhook secret

### Duplicate Prevention

- Store transaction references in database
- Check for existing transactions before processing
- Use idempotency keys

### Data Protection

Never store:
- Full card numbers
- PIN codes
- CVV codes
- Sensitive authentication data

---

## Troubleshooting

### Common Issues

#### M-Pesa

**Issue**: STK Push not received
- Check phone number format (254...)
- Verify M-Pesa account status
- Check if phone has sufficient funds
- Retry after 1 minute

**Issue**: Payment shows failed but money deducted
- Wait 5-10 minutes for callback
- Check transaction status on M-Pesa
- Contact support with transaction ID

#### Flutterwave

**Issue**: Payment pending for long time
- Check if customer completed payment
- Verify webhook is configured
- Check transaction status in Flutterwave dashboard

**Issue**: Card declined
- Customer should contact their bank
- Check if card is 3D secure enabled

#### Stripe

**Issue**: PaymentIntent creation failed
- Verify API keys are correct
- Check currency is supported
- Check amount is within limits

---

## Testing

### Sandbox Accounts

| Provider | Test Phone | Test Card |
|----------|------------|-----------|
| M-Pesa | 254708374148 | - |
| Flutterwave | Various test numbers | 5531 8866 0123 5542 |
| Stripe | - | 4242 4242 4242 4242 |

### Test Environment

```env
# Set to sandbox for testing
MPESA_ENVIRONMENT=sandbox
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3
```

---

## Provider Limits

### M-Pesa

| Limit Type | Value |
|------------|-------|
| Minimum | KES 1 |
| Maximum | KES 150,000 |
| Daily Limit | KES 300,000 |

### Flutterwave

| Limit Type | Value |
|------------|-------|
| Minimum | Varies by currency |
| Maximum | Varies by country |
| Daily Limit | Varies by verification |

### Stripe

| Limit Type | Value |
|------------|-------|
| Minimum | $0.50 USD |
| Maximum | $999,999.99 USD |
| No daily limits | - |

---

## Contact

For payment issues:
- Email: payments@identafrica.com
- Support: +254 700 000 000

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-07 | Initial payment system |
