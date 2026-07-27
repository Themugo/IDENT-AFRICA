# IDENT AFRICA - Disaster Recovery Plan

**Document Version:** 1.0  
**Last Updated:** 2026-07-27  
**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 1 hour

---

## Executive Summary

IDENT AFRICA operates on a modern cloud-native architecture with multiple layers of redundancy. This document outlines the disaster recovery procedures for various failure scenarios.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN (Vercel Edge)                       │
│                    Global Distribution + Caching                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                           │
│              React SPA + Automatic Scaling                       │
│                   └── Serverless Functions                      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Railway)                             │
│              Express.js API + Auto-restart                       │
│                   └── Horizontal Scaling                        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Supabase PostgreSQL          │   │     External Services            │
│  Automated Backups              │   │  - Gemini AI                   │
│  Point-in-time Recovery         │   │  - Stripe                      │
│  Read Replicas (when enabled)   │   │  - M-Pesa                     │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## Backup Strategy

### Database Backups (Supabase)

| Backup Type | Frequency | Retention | Storage |
|------------|----------|----------|---------|
| Continuous | Real-time | 7 days | Supabase managed |
| Point-in-time | Every 7 days | 30 days | Supabase managed |
| Manual export | On-demand | User-defined | External storage |

### Application Backups

| Asset | Backup Method | Frequency | Retention |
|-------|--------------|----------|----------|
| Code | GitHub repository | Every push | Indefinite |
| Environment variables | Vercel encrypted | On change | Indefinite |
| User uploads | Supabase Storage | Real-time | 90 days |
| Configuration | Git | Every commit | Indefinite |

---

## Disaster Scenarios & Recovery Procedures

### Scenario 1: Complete Vercel Outage

**Probability:** Low  
**Impact:** Complete frontend unavailability

**Recovery Steps:**
1. Check Vercel status: https://vercel.status.io
2. If Vercel is down:
   - Wait 5 minutes for automatic resolution
   - Contact Vercel support if > 15 minutes
3. Alternative: Deploy to Netlify or Cloudflare Pages
   ```bash
   # Build for alternative platform
   npm run build
   # Deploy to Netlify (example)
   netlify deploy --prod --dir=dist
   ```

### Scenario 2: Database Connection Failure

**Probability:** Low  
**Impact:** API failures, data unavailability

**Recovery Steps:**
1. Verify Supabase status: https://status.supabase.com
2. Check DATABASE_URL environment variable
   ```bash
   vercel env pull  # Pull production variables
   ```
3. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```
4. If database is down:
   - App continues with mock data (graceful degradation)
   - Monitor for automatic recovery
   - Contact Supabase support if > 15 minutes

### Scenario 3: Railway Backend Failure

**Probability:** Low  
**Impact:** API unavailability

**Recovery Steps:**
1. Check Railway status: https://status.railway.app
2. If Railway is down:
   - Railway auto-restarts failed instances
   - Scale to multiple instances if needed
3. Alternative: Deploy to Render or Fly.io
   ```bash
   # Build production
   npm run build
   # Deploy alternative (example Render)
   render deploy --service-id=xxx
   ```

### Scenario 4: Payment Gateway Failure

**Probability:** Medium  
**Impact:** Booking flow broken

**Recovery Steps:**
1. Check payment gateway status:
   - Stripe: https://status.stripe.com
   - M-Pesa: Contact Safaricom
2. If gateway is down:
   - Enable manual payment mode
   - Display "Payment processing temporarily unavailable" message
   - Queue payments for later processing
3. Implement fallback:
   ```typescript
   // Enable manual payment fallback
   const paymentMode = process.env.PAYMENT_MODE; // 'auto' | 'manual'
   ```

### Scenario 5: Security Breach

**Probability:** Very Low  
**Impact:** Data exposure, unauthorized access

**Recovery Steps:**
1. **IMMEDIATE (0-5 minutes):**
   - Identify affected systems
   - Block suspicious IPs
   - Revoke compromised credentials
   ```bash
   # Block IPs at firewall
   vercel firewall block <ip>
   
   # Rotate secrets
   vercel env rm JWT_SECRET
   vercel env add JWT_SECRET
   ```
2. **SHORT-TERM (5-30 minutes):**
   - Disable affected services
   - Begin forensic analysis
   - Notify security team
3. **LONG-TERM (30-60 minutes):**
   - Restore from backup if needed
   - Implement security patches
   - Review access logs

---

## Rollback Procedures

### Frontend Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or redeploy from git
git revert HEAD
git push origin main
# Vercel auto-deploys on push
```

### Backend Rollback (Railway)

```bash
# Via Railway dashboard:
# 1. Go to Service → Deployments
# 2. Find previous working deployment
# 3. Click "Redeploy"

# Via Railway CLI:
railway run --service <service-id> [previous-deployment-id]
```

### Database Rollback

```sql
-- Point-in-time recovery (Supabase)
-- 1. Create new database from backup
CREATE DATABASE restored_db WITH CLONE original_db;

-- 2. Point application to restored database
-- Update DATABASE_URL

-- 3. Verify data integrity
SELECT count(*) FROM users;
SELECT count(*) FROM bookings;
```

---

## Monitoring & Alerts

### Critical Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| Site Down | HTTP 5xx > 1% | Page on-call engineer |
| API Error Rate | > 1% | Page on-call engineer |
| Database Connection | Failed | Page on-call engineer |
| Payment Failure | > 0.5% | Alert finance team |
| Security Event | Any | Page security team |

### Uptime Monitoring

```bash
# External monitoring services:
# - Vercel built-in: Automatic
# - UptimeRobot: Every 1 minute
# - Pingdom: Every 1 minute
# - Better Uptime: Every 1 minute

# Recommended checks:
# 1. https://identafrica.com (frontend)
# 2. https://api.identafrica.com/api/health (backend)
# 3. https://api.identafrica.com/api/db/health (database)
```

---

## Communication Plan

### Internal Communication

| Severity | Channel | Response Time |
|----------|---------|--------------|
| SEV-1 | Slack #incidents + PagerDuty | 5 minutes |
| SEV-2 | Slack #engineering | 15 minutes |
| SEV-3 | Slack #engineering | 1 hour |
| SEV-4 | GitHub Issues | 24 hours |

### Customer Communication

| Severity | Channel | Template |
|----------|---------|----------|
| SEV-1 | Status page + Email | [Template A](#template-a) |
| SEV-2 | Status page | [Template B](#template-b) |
| SEV-3 | Status page (if > 1 hour) | [Template C](#template-c) |

### Communication Templates

#### Template A: Service Outage
```
Subject: [RESOLVED] Ident Africa Service Update - [DATE]

Dear Valued Guest,

We experienced a technical issue affecting [SERVICE] on [DATE] between [TIME] and [TIME].

[IMPACT DESCRIPTION]

Our team identified and resolved the issue at [RESOLUTION TIME]. [SERVICE] is now fully operational.

We sincerely apologize for any inconvenience this may have caused. As a gesture of goodwill, [COMPENSATION IF APPLICABLE].

Thank you for your patience and understanding.

Best regards,
The Ident Africa Team
```

---

## Testing & Validation

### Quarterly DR Testing

| Test | Frequency | Owner | Last Test |
|------|----------|-------|----------|
| Full DR simulation | Quarterly | DevOps | TBD |
| Backup restoration | Monthly | DevOps | TBD |
| Failover test | Monthly | DevOps | TBD |
| Incident response drill | Quarterly | Engineering | TBD |

### DR Test Checklist

- [ ] Verify backup completeness
- [ ] Test database restore
- [ ] Verify rollback procedures
- [ ] Test failover to backup region
- [ ] Validate monitoring alerts
- [ ] Test communication plan
- [ ] Document test results

---

## Key Contacts

| Role | Name | Contact | Backup |
|------|------|--------|--------|
| DevOps Lead | [PRIVATE] | [PRIVATE] | Engineering Lead |
| Engineering Lead | [PRIVATE] | [PRIVATE] | CTO |
| CTO | [PRIVATE] | [PRIVATE] | - |
| Supabase Support | Enterprise Support | support@supabase.com | - |
| Vercel Support | Enterprise Support | support@vercel.com | - |

---

## Review Schedule

- **Daily:** Automated monitoring review
- **Weekly:** Backup verification
- **Monthly:** DR procedure review
- **Quarterly:** Full DR simulation test
- **Annually:** Document revision

---

**Document Owner:** Engineering Team  
**Approval:** CTO  
**Next Review:** 2026-10-27
