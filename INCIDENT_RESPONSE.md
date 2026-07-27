# IDENT AFRICA - Incident Response Guide

This guide provides procedures for diagnosing and recovering from production incidents.

---

## 🚨 Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **SEV1** | Critical - Full system down | Immediate | Site unreachable, data breach |
| **SEV2** | High - Major feature broken | < 15 min | Payment processing fails |
| **SEV3** | Medium - Feature degraded | < 1 hour | Slow page loads, errors |
| **SEV4** | Low - Minor issue | < 4 hours | UI glitch, non-critical bug |

---

## 🔍 Diagnosis Procedures

### 1. Initial Assessment

```bash
# Check system health
curl https://api.identafrica.com/health

# Check status page
curl https://api.identafrica.com/status

# View recent logs
# Check /health endpoint response:
# - status: "healthy" | "degraded" | "unhealthy"
# - checks[]: individual component status
```

### 2. Common Issues

#### Application Not Responding

```bash
# SSH to server
ssh user@server

# Check process status
pm2 status
pm2 logs ident-africa --lines 100

# Check memory
free -h
df -h

# Check CPU
top -c
```

#### Database Connection Issues

```bash
# Check database health
curl https://api.identafrica.com/api/db/health

# Connect to database
psql $DATABASE_URL

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

#### API Errors

```bash
# Check API logs
grep -i error /var/log/ident-africa/*.log

# Check specific endpoint
curl -v https://api.identafrica.com/api/health

# Test with different status codes
curl -I https://api.identafrica.com/health
```

### 3. Health Check Interpretation

#### `/health` Response

```json
{
  "status": "degraded",
  "timestamp": "2026-01-01T00:00:00Z",
  "checks": [
    { "name": "application", "status": "healthy" },
    { "name": "database", "status": "healthy" },
    { "name": "memory", "status": "degraded" },
    { "name": "api", "status": "healthy" }
  ]
}
```

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | All systems operational | Monitor |
| `degraded` | Some issues, partial operation | Investigate affected components |
| `unhealthy` | Critical failure | Immediate response |

---

## 🔧 Recovery Procedures

### 1. Application Restart

```bash
# Restart application
pm2 restart ident-africa

# Or graceful reload
pm2 reload ident-africa

# Check status after restart
pm2 status
pm2 logs ident-africa --lines 50
```

### 2. Database Recovery

```bash
# Check connection pool
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Kill hung queries
SELECT pg_cancel_backend(pid) FROM pg_stat_activity 
WHERE now() - query_start > interval '5 minutes';

# Force restart if needed
# (Last resort - may cause data loss)
```

### 3. Memory Issues

```bash
# Check memory usage
pm2 show ident-africa

# Restart if memory leak suspected
pm2 restart ident-africa --update-env

# Or scale horizontally
pm2 scale ident-africa 2
```

### 4. Payment Issues

```bash
# Check payment logs
grep -i payment /var/log/ident-africa/*.log

# Verify gateway status
# Stripe: https://status.stripe.com
# Flutterwave: https://status.flutterwave.com
# M-Pesa: Contact Safaricom

# Manual refund if needed
# See Payment Troubleshooting below
```

---

## 📞 Escalation Matrix

| Issue Type | Primary Contact | Secondary Contact | Escalation Time |
|------------|-----------------|-------------------|-----------------|
| Payment | Finance Lead | CTO | 15 min |
| Security | Security Team | CTO | Immediate |
| Database | DevOps Lead | CTO | 15 min |
| Frontend | Tech Lead | CTO | 30 min |
| Third-party | Vendor Support | DevOps | 30 min |

### Contact Information

```
CTO: [cto@identafrica.com]
DevOps: [devops@identafrica.com]
Security: [security@identafrica.com]

Emergency (24/7): [+XXX-XXX-XXXX]
```

---

## 🛠️ Common Fixes

### High Memory Usage

1. Check for memory leaks in code
2. Restart application: `pm2 restart ident-africa`
3. Scale horizontally: `pm2 scale ident-africa 2`
4. Add swap if needed

### Database Connection Pool Exhausted

1. Check for long-running queries
2. Kill stuck connections: `SELECT pg_terminate_backend(pid)`
3. Increase pool size in config
4. Restart application

### Slow API Response

1. Check database query performance
2. Review recent code changes
3. Check for external API timeouts
4. Scale application instances

### Payment Processing Failures

1. Verify payment gateway credentials
2. Check gateway status pages
3. Review webhook logs
4. Contact payment provider support

---

## 📋 Incident Response Checklist

### Phase 1: Detection (0-5 min)
- [ ] Alert received
- [ ] Initial assessment complete
- [ ] Severity level assigned
- [ ] Response team notified

### Phase 2: Investigation (5-30 min)
- [ ] Root cause identified
- [ ] Impact assessed
- [ ] Affected systems listed
- [ ] Fix strategy determined

### Phase 3: Resolution (30 min - 4 hours)
- [ ] Fix implemented
- [ ] Changes deployed
- [ ] Monitoring verified
- [ ] Issue resolved

### Phase 4: Recovery (1-4 hours)
- [ ] Services restored
- [ ] All checks passing
- [ ] Performance normal
- [ ] Customers notified

### Phase 5: Post-Incident (24-48 hours)
- [ ] Post-mortem scheduled
- [ ] Root cause documented
- [ ] Action items created
- [ ] Lessons learned shared

---

## 📊 Post-Incident Review

### Template

```markdown
# Incident Report: [YYYY-MM-DD]

## Summary
Brief description of the incident.

## Timeline
| Time | Event |
|------|-------|
| HH:MM | Alert received |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |

## Root Cause
What caused the incident?

## Impact
- Users affected: XXX
- Duration: XX minutes
- Revenue impact: $XXX

## Resolution
How was it fixed?

## Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| | | |

## Lessons Learned
What can we improve?
```

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Database Console | https://supabase.com/dashboard |
| Error Tracking | https://sentry.io (if configured) |
| Status Page | https://status.identafrica.com |
| CloudWatch | AWS Console (if configured) |

---

## 📱 Runbook Quick Reference

### Quick Status Check
```bash
curl https://api.identafrica.com/health | jq .
```

### Quick Restart
```bash
pm2 restart ident-africa
```

### View Recent Errors
```bash
pm2 logs ident-africa --err --lines 50
```

### Check Performance
```bash
curl https://api.identafrica.com/status | jq '.metrics'
```

---

**Last Updated:** 2026-07-25
**Version:** 1.0
