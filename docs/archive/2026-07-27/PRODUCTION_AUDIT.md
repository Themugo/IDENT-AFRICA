# IDENT AFRICA - Production Engineering Audit

**Date:** 2026-07-27  
**Target:** Lighthouse Mobile Score 95+ | Core Web Vitals Green | Deployment Reliability 99.9%

---

## Executive Summary

This audit evaluates the IDENT AFRICA platform against production-grade reliability and performance standards. The application has a solid foundation with proper security headers, code splitting, and health monitoring, but requires targeted improvements to achieve Lighthouse 95+ and enterprise-grade reliability.

| Category | Current Status | Target | Gap |
|----------|---------------|--------|-----|
| Performance | ⚠️ 85-90 | 95+ | 5-10 points |
| Core Web Vitals | ⚠️ Needs monitoring | All Green | Monitoring required |
| API Rate Limiting | ❌ Missing | 100 req/min | Implementation needed |
| Error Monitoring | ⚠️ Basic logging | Sentry + Alerts | Integration needed |
| Image Optimization | ⚠️ External URLs | CDN + WebP | Pipeline needed |
| Deployment | ⚠️ Manual | CI/CD + Canary | Automation needed |

---

## 1. Performance Audit (Lighthouse 95+ Target)

### Current Build Analysis

```
Build Output:
├── react-vendor:      3.90 kB (gzipped: 1.52 kB) ✅
├── lucide-vendor:    50.21 kB (gzipped: 12.04 kB) ✅
├── motion-vendor:    102.96 kB (gzipped: 34.38 kB) ⚠️ Large
├── index.es:         159.71 kB (gzipped: 53.57 kB) ✅
└── CSS:              166.40 kB (gzipped: 24.67 kB) ✅
```

### 1.1 Identified Issues

| Issue | Impact | Fix Priority |
|-------|--------|--------------|
| Motion library (103KB) loaded on all pages | LCP, TBT | High - lazy load |
| Hero images not preloaded | LCP | High - preload hero |
| No image srcset/sizes | LCP | Medium - responsive images |
| External Unsplash images | LCP | Medium - CDN proxy |

### 1.2 Recommendations

#### A. Lazy Load Motion Library

```typescript
// src/components/home/ConversionHome.tsx
const MotionComponents = lazy(() => import('./MotionComponents'));
```

#### B. Preload Critical Hero Image

```html
<!-- index.html -->
<link 
  rel="preload" 
  as="image"
  href="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"
  fetchpriority="high"
/>
```

#### C. Add Image Optimization Component

```typescript
// src/components/common/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, sizes = '100vw', priority = false }) => {
  // Convert Unsplash URL to optimized version
  const optimizedSrc = src.includes('unsplash.com') 
    ? `${src}&auto=format&fit=crop&w=800&q=75`
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};
```

---

## 2. Core Web Vitals Optimization

### 2.1 Current Metrics (Estimated)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | ~3.0s | ⚠️ |
| FID (First Input Delay) | < 100ms | ~50ms | ✅ |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.08 | ✅ |
| TTFB (Time to First Byte) | < 200ms | ~300ms | ⚠️ |

### 2.2 Web Vitals Monitoring

Add Web Vitals tracking:

```typescript
// src/utils/webVitals.ts
import { onLCP, onFID, onCLS, onFCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onLCP((metric) => sendToAnalytics('LCP', metric.value));
  onFID((metric) => sendToAnalytics('FID', metric.value));
  onCLS((metric) => sendToAnalytics('CLS', metric.value));
  onFCP((metric) => sendToAnalytics('FCP', metric.value));
  onTTFB((metric) => sendToAnalytics('TTFB', metric.value));
}

function sendToAnalytics(name: string, value: number) {
  // Send to Vercel Analytics, GA4, or custom endpoint
  window.gtag?.('event', name, { value });
}
```

```tsx
// src/App.tsx
import { reportWebVitals } from './utils/webVitals';

export default function App() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return <AppProvider>...</AppProvider>;
}
```

### 2.3 Vercel Analytics Integration

```html
<!-- index.html - Add before closing </head> -->
<script>
  window.va = window.va || function () { (window.va.q = window.va.q || []).push(arguments); };
  va('vapi', 'https://vapi.vercel-scripts.com/v1');
</script>
<script defer src='https://va.vercel-analytics.com/analytics.js'></script>
```

---

## 3. API Rate Limiting

### Current Status
❌ **express-rate-limit** is mentioned in SECURITY.md but NOT installed.

### 3.1 Implementation Required

```bash
npm install express-rate-limit
```

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests' }
});

// Auth rate limit (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many login attempts' }
});

// Search rate limit
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, error: 'Search limit exceeded' }
});

// AI Planner rate limit (expensive operation)
export const aiPlannerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: 'AI planner limit exceeded' }
});
```

### 3.2 Apply to server.ts

```typescript
// server.ts
import { apiLimiter, authLimiter, searchLimiter, aiPlannerLimiter } from './src/middleware/rateLimit.js';

// Auth routes - stricter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Search routes
app.use('/api/search', searchLimiter);

// AI planner
app.use('/api/ai', aiPlannerLimiter);

// General API
app.use('/api/', apiLimiter);
```

---

## 4. Error Monitoring & Alerting

### Current Status
⚠️ Basic console logging exists, but no external monitoring.

### 4.1 Sentry Integration

```bash
npm install @sentry/react @sentry/node
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

export default function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <AppProvider>...</AppProvider>
      </Sentry.ErrorBoundary>
    </ErrorBoundary>
  );
}
```

### 4.2 Alert Configuration

Create alert rules for production:

| Alert | Threshold | Severity |
|-------|-----------|----------|
| Error Rate | > 1% | Critical |
| P95 Latency | > 2s | Warning |
| P99 Latency | > 5s | Critical |
| Memory Usage | > 85% | Warning |
| API 5xx | > 0.5% | Critical |

---

## 5. Image Optimization Pipeline

### 5.1 Recommended Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│ Unsplash Source │ ──► │   Vercel CDN │ ──► │   Browser  │
└─────────────────┘     │  (Automatic  │     │  (Next-gen │
                       │   WebP/AVIF) │     │   formats) │
                       └──────────────┘     └────────────┘
```

### 5.2 Image Component Enhancement

```typescript
// src/components/common/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75
}) => {
  // For Vercel/Next.js Image optimization
  if (src.startsWith('/') || src.includes('vercel')) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  // For external images (Unsplash)
  const optimizedUrl = new URL(src);
  optimizedUrl.searchParams.set('auto', 'format');
  optimizedUrl.searchParams.set('fit', 'crop');
  optimizedUrl.searchParams.set('q', String(quality));
  if (width) optimizedUrl.searchParams.set('w', String(width));

  return (
    <img
      src={optimizedUrl.toString()}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};
```

### 5.3 Responsive Image Sizes

```typescript
// Generate srcset for responsive images
function generateSrcSet(originalUrl: string, widths = [320, 640, 960, 1280]) {
  return widths
    .map(w => {
      const url = new URL(originalUrl);
      url.searchParams.set('w', String(w));
      url.searchParams.set('q', '75');
      return `${url.toString()} ${w}w`;
    })
    .join(', ');
}
```

---

## 6. Deployment Reliability

### 6.1 Recommended Vercel Configuration

```json
// vercel.json - Enhanced
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.ts" },
    { "src": "/(.*)", "dest": "/dist/index.html" }
  ],
  "regions": ["fra1", "cpt1", "iad1"],
  "verticalScale": {
    "memory": 4096,
    "vcpus": 8
  },
  "functions": {
    "server.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-DNS-Prefetch-Control", "value": "on" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 6.2 Health Check Endpoint Enhancement

```typescript
// Enhanced health check with detailed status
app.get('/api/health', async (_req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkExternalAPIs(),
    checkMemory(),
  ]);

  const healthy = checks.filter(c => c.status === 'fulfilled').length;
  const total = checks.length;
  const status = healthy === total ? 'healthy' : healthy > total / 2 ? 'degraded' : 'unhealthy';

  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    version: process.env.npm_package_version,
    timestamp: new Date().toISOString(),
    checks: checks.map((c, i) => ({
      name: ['database', 'external_apis', 'memory'][i],
      status: c.status === 'fulfilled' ? 'up' : 'down',
      latency: c.status === 'fulfilled' ? c.value.latency : null,
    })),
  });
});
```

### 6.3 Graceful Shutdown

```typescript
// server.ts
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  await closeDatabaseConnections();
  
  process.exit(0);
});
```

---

## 7. Railway Backend Configuration

### 7.1 railway.toml

```toml
[railway]
environment = "production"

[deployment]
region = "eu-west"
numInstances = 2

[start]
command = "npm run start"

[healthcheck]
path = "/api/health"
interval = 30
timeout = 10
retries = 3

[environment]
NODE_ENV = "production"
PORT = "8080"
```

### 7.2 Environment Variables (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Supabase PostgreSQL | postgresql://... |
| REDIS_URL | Cache (optional) | redis://... |
| SENTRY_DSN | Error tracking | https://...@sentry.io/... |
| LOGDNA_KEY | Log aggregation | xxxxxx |

---

## 8. Supabase PostgreSQL Optimization

### 8.1 Connection Pooling

```typescript
// src/database/pool.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false },
});
```

### 8.2 Recommended Indexes

```sql
-- destinations
CREATE INDEX idx_destinations_country ON destinations(country);
CREATE INDEX idx_destinations_published ON destinations(status) WHERE status = 'published';

-- bookings
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- payments
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 9. Implementation Priority

### Phase 1: Critical (Week 1)

| Task | Impact | Effort |
|------|--------|--------|
| Install express-rate-limit | Security | 1hr |
| Add rate limiting to API | Security | 2hr |
| Preload hero images | LCP | 1hr |
| Lazy load Motion library | TBT | 2hr |
| Add Sentry error tracking | Monitoring | 3hr |

### Phase 2: High Priority (Week 2)

| Task | Impact | Effort |
|------|--------|--------|
| Add Web Vitals monitoring | CWV | 2hr |
| Implement image srcset | LCP | 4hr |
| Configure Vercel Analytics | Analytics | 1hr |
| Add health check alerts | Reliability | 2hr |
| Optimize database indexes | Performance | 3hr |

### Phase 3: Enhancement (Week 3)

| Task | Impact | Effort |
|------|--------|--------|
| CDN configuration | Performance | 4hr |
| CI/CD pipeline | Deployment | 8hr |
| Canary deployments | Deployment | 6hr |
| Load testing | Reliability | 4hr |

---

## 10. Checklist Summary

### Performance
- [ ] Lazy load Motion library
- [ ] Preload critical hero images
- [ ] Add responsive image srcset
- [ ] Implement Web Vitals tracking
- [ ] Enable Vercel Analytics

### Security
- [ ] Install express-rate-limit
- [ ] Apply rate limits to all endpoints
- [ ] Implement stricter limits for auth/AI
- [ ] Add request validation middleware
- [ ] Configure CORS properly

### Monitoring
- [ ] Integrate Sentry error tracking
- [ ] Add performance monitoring
- [ ] Configure uptime alerts
- [ ] Set up error rate alerts
- [ ] Add latency alerts

### Deployment
- [ ] Configure Railway health checks
- [ ] Add graceful shutdown
- [ ] Set up CI/CD pipeline
- [ ] Configure canary deployments
- [ ] Add database connection pooling

---

## Appendix: Environment Variables Required

### Vercel (Frontend)
```
NEXT_PUBLIC_APP_URL=https://identafrica.com
NEXT_PUBLIC_API_URL=https://api.identafrica.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Railway (Backend)
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=xxx
GEMINI_API_KEY=xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
LOGDNA_KEY=xxx
```

### Supabase
```
DATABASE_URL=postgresql://xxx:xxx@xxx.supabase.co:5432/postgres
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-27  
**Next Review:** Before production launch
