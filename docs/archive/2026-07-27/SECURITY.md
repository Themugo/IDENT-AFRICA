# IDENT AFRICA - Security Policy

This document outlines the security practices and policies for IDENT AFRICA.

## 🔒 Security Overview

IDENT AFRICA implements industry-standard security measures to protect user data and ensure safe operation.

### Implemented Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| HTTPS | ✅ Required | All traffic must use HTTPS |
| Helmet.js | ✅ Enabled | Security headers |
| CORS | ✅ Configured | Origin whitelist |
| JWT Auth | ✅ Implemented | Token-based authentication |
| Input Validation | ✅ Enabled | All API inputs validated |
| Input Sanitization | ✅ Enabled | XSS prevention |
| Rate Limiting | ⚠️ Ready | Structure in place |

---

## Environment Security

### Required Environment Variables

**NEVER commit real secrets to version control.**

| Variable | Purpose | Security Level |
|----------|---------|----------------|
| `JWT_SECRET` | Token signing | 🔴 Critical |
| `GEMINI_API_KEY` | AI service access | 🔴 Critical |
| `DATABASE_URL` | Database connection | 🔴 Critical |
| `STRIPE_SECRET_KEY` | Payment processing | 🔴 Critical |

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate random password
openssl rand -base64 32
```

### Environment File Security

The `.env` file is protected by `.gitignore`:
```
.env
.env.local
.env.production
.env.*.local
```

Only `.env.example` is committed (with placeholder values).

---

## API Security

### Request Validation

All API endpoints validate:
- Email format (regex validation)
- Phone numbers (format and length)
- Numeric ranges (amounts, counts)
- String lengths (sanitization)
- Required fields

### Response Security

Error messages are sanitized:
- Production: Generic error messages
- Development: Detailed errors for debugging

```typescript
// Example: Safe error response
res.status(500).json({
  success: false,
  error: 'Internal server error',
  // details hidden in production
});
```

### Rate Limiting

Recommended setup for production:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

---

## Authentication Security

### JWT Implementation

- **Algorithm**: HS256
- **Expiry**: 24 hours (configurable)
- **Storage**: Client-side localStorage
- **Transport**: Authorization header (Bearer token)

### Password Requirements

- Minimum 8 characters
- Demo password: `demo123` (for testing only)
- Production: Use bcrypt hashing

### Demo Credentials

For testing purposes:
```
Email: kamauwamakena@gmail.com
Password: demo123
```

⚠️ **Change these before production deployment.**

---

## Database Security

### PostgreSQL Best Practices

1. **Use connection pooling**
2. **Enable SSL connections**
3. **Use least privilege principle**
4. **Regular backups**

### Example Connection String
```
postgresql://user:password@host:5432/database?sslmode=require
```

### Indexes for Performance & Security

The schema includes indexes to optimize queries:
- Composite indexes for common search patterns
- Indexes on foreign keys
- Partial indexes for active records

---

## Frontend Security

### Content Security Policy

Implemented via Helmet.js:
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'", "https://open.er-api.com", "https://generativelanguage.googleapis.com"],
  }
}
```

### XSS Prevention

- React auto-escapes output
- User input sanitized before storage
- No `dangerouslySetInnerHTML` without sanitization

### Sensitive Data

Never store in frontend:
- API keys (use environment variables)
- Passwords (use JWT tokens)
- Database credentials (use server-side only)

---

## Payment Security

### Supported Gateways

| Gateway | Status | Security |
|---------|--------|----------|
| Stripe | ✅ Implemented | PCI DSS compliant |
| Flutterwave | ✅ Implemented | PCI DSS compliant |
| M-Pesa | ✅ Implemented | End-to-end encryption |

### Payment Best Practices

1. Never log payment details
2. Use HTTPS for all payment pages
3. Implement 3D Secure when available
4. Store minimal payment data

---

## Security Headers

Implemented headers (via vercel.json and Helmet):

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | XSS filter |
| Referrer-Policy | strict-origin | Control referrer info |
| Permissions-Policy | camera=(), etc. | Limit browser features |

---

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@identafrica.com
2. **Private GitHub Issue**: Use "security" label

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: 24-48 hours
- **Initial Assessment**: 3-5 days
- **Fix Deployment**: Based on severity
- **Public Disclosure**: After fix is deployed

---

## Security Checklist

Before production deployment, verify:

- [ ] HTTPS enabled
- [ ] CORS origins configured for production domain
- [ ] JWT_SECRET changed from default
- [ ] All API keys from environment variables
- [ ] No debug code in production
- [ ] Error messages sanitized
- [ ] Database SSL enabled
- [ ] Payment gateway webhook secrets set
- [ ] Security headers configured
- [ ] Rate limiting enabled

---

## Regular Security Practices

### Dependencies
```bash
# Check for vulnerabilities
npm audit

# Update regularly
npm update
```

### Database
- Weekly backups
- Monthly security updates
- Monitor for unauthorized access

### Application
- Log monitoring
- Error rate alerts
- Uptime monitoring

---

## Compliance

IDENT AFRICA follows these security standards:

- **OWASP Top 10**: Application security guidelines
- **GDPR**: Data protection (EU users)
- **PCI DSS**: Payment card security (when processing payments)

---

## Contact

For security concerns:
- **Email**: security@identafrica.com
- **GitHub**: Open an issue with "security" label

**Do NOT** disclose security issues publicly until they are resolved.
