# Environment Configuration Guide

This guide explains how to configure IDENT AFRICA for different environments.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual values

3. Never commit `.env` - it's already in `.gitignore`

## Environment Variables

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | http://localhost:3000 |
| `NEXT_PUBLIC_API_URL` | API Server URL | http://localhost:3001/api |
| `NEXT_PUBLIC_ADMIN_URL` | Admin Panel URL | http://localhost:3000/admin |

### Backend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |

### Database

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |

### Authentication

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | JWT signing secret (REQUIRED in production) |
| `SESSION_SECRET` | Session secret (REQUIRED in production) |

### AI Services

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |

### Payments

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `MPESA_CONSUMER_KEY` | M-Pesa consumer key |
| `MPESA_CONSUMER_SECRET` | M-Pesa consumer secret |

## Production Setup

### Required Variables for Production

1. **Authentication**
   - [ ] Set `JWT_SECRET` to a secure random string
   - [ ] Set `SESSION_SECRET` to a secure random string

2. **Database**
   - [ ] Set `DATABASE_URL` to your production PostgreSQL URL

3. **Payments**
   - [ ] Configure Stripe keys (use `sk_live_*`)
   - [ ] Configure M-Pesa keys for live mode

4. **AI**
   - [ ] Set `GEMINI_API_KEY`

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 64
```

## Vercel Deployment

### Environment Variables in Vercel

1. Go to Project Settings → Environment Variables

2. Add all required variables for:
   - Production
   - Preview
   - Development

3. Use `NEXT_PUBLIC_` prefix for client-side variables

### Required Vercel Variables

```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app/api
NEXT_PUBLIC_APP_ENV=production

NODE_ENV=production

JWT_SECRET=<generated-secret>
SESSION_SECRET=<generated-secret>
DATABASE_URL=<production-db-url>

GEMINI_API_KEY=<your-api-key>
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Configuration Service

Use the configuration service to access values:

```typescript
// Backend (Node.js)
import { config } from './config';

const apiUrl = config.app.apiUrl;
const isProduction = config.isProduction;

// Frontend (Next.js)
import { apiUrl, isProduction } from './config/client';
```

## Feature Flags

Control features with environment variables:

| Flag | Description |
|------|-------------|
| `FEATURE_AI_PLANNER` | Enable AI trip planner |
| `FEATURE_MOBILE_PAYMENTS` | Enable mobile payments (M-Pesa) |
| `FEATURE_REFERRALS` | Enable referral system |
| `FEATURE_LOYALTY` | Enable loyalty points |

## Security Notes

1. **Never commit secrets** - `.env` files are gitignored
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** in production
4. **Use strong passwords** - minimum 32 characters
5. **Enable HTTPS** in production

## Troubleshooting

### "JWT_SECRET not set" error

```bash
# Generate a new secret
openssl rand -base64 64

# Add to .env
JWT_SECRET=<generated-value>
```

### "Cannot connect to database"

1. Check `DATABASE_URL` is correct
2. Verify database is running
3. Check network/firewall settings

### "API key not configured"

1. Get API keys from respective services
2. Add to environment variables
3. Restart the server
