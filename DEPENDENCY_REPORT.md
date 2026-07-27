# IDENT AFRICA - Dependency Report

**Report Date:** 2026-07-27  
**Scope:** Component and service dependency mapping

---

## 1. Application Dependencies

### 1.1 Core Dependencies

```
react ^19.0.1          - UI framework
react-dom ^19.0.1      - DOM rendering
motion ^12.23.24       - Animations
lucide-react ^0.546.0  - Icons
```

### 1.2 Backend Dependencies

```
express ^4.21.2        - HTTP server
@google/genai ^2.4.0   - AI integration
pg ^8.22.0             - PostgreSQL client
stripe                  - Payment gateway
dotenv ^17.2.3         - Environment config
helmet ^8.3.0          - Security headers
cors ^2.8.6           - CORS handling
compression ^1.8.1     - Response compression
bcrypt ^6.0.0          - Password hashing
express-rate-limit ^8.6.1 - Rate limiting
```

### 1.3 Build Dependencies

```
vite ^6.2.3            - Build tool
typescript ~5.8.2      - Type checking
tailwindcss ^4.1.14    - Styling
esbuild                 - Server bundling
```

---

## 2. Service Dependency Map

### 2.1 Used Services

| Service | Files | Dependencies | Type |
|---------|-------|--------------|------|
| ai | AI service | 51 | Core |
| search | Search routes | 11 | Core |
| pricing | Pricing routes | 8 | Core |
| recommendations | AI, search | 5 | Feature |
| seo | Components | 2 | Feature |
| media | Routes, components | 2 | Feature |

### 2.2 Unused Services

| Service | Files | Reason |
|---------|-------|--------|
| analytics | 1 | Not imported |
| documents | 3 | Not imported |
| inventory | 3 | Not imported |
| mobile | 5 | Deprecated |
| payments | providers/ | Not imported |

---

## 3. Component Dependency Tree

### 3.1 App.tsx Imports

```
App.tsx
├── AppContext (state management)
├── ErrorBoundary (error handling)
├── webVitals (performance tracking)
├── sentry (error monitoring)
├── Header (navigation)
├── Footer (navigation)
├── BreadcrumbBar (navigation)
├── StickyInquiryButton (CRO)
├── QuickNavDrawer (navigation)
├── MobileBottomNav (mobile nav)
├── ConversionHome (homepage)
├── LuxuryStoryBlocks (branding)
├── EastAfricaMap (destinations)
├── MigrationRoutes (content)
├── ConservationImpact (content)
├── AuthoritySection (trust)
├── FeaturedDestinations (listings)
├── ExperiencePillars (content)
├── ItineraryShowcase (listings)
├── InteractiveMap (exploration)
├── SeasonalCalendar (planning)
├── TrustPillars (trust)
├── Testimonials (social proof)
├── DestinationListing (listings)
├── DestinationDetail (detail)
├── HotelListing (listings)
├── HotelDetail (detail)
├── HotelComparator (comparison)
├── TripComparator (comparison)
├── LuxurySafariConcierge (AI)
├── AISafariPlanner (AI)
├── VisualItineraryBuilder (planning)
├── UserDashboard (authenticated)
├── AdminDashboard (admin)
├── SupplierPortal (supplier)
├── BookingHistoryView (booking)
├── SearchPage (search)
├── AuthModal (auth)
├── BookingModal (booking)
└── LuxuryBookingFlow (booking)
```

### 3.2 Route Dependencies

```
server.ts
├── destinations router
├── lodges router
├── bookings router
├── users router
├── payments router
├── suppliers router
├── admin router
├── cms router
├── pageBuilder router
├── media router
├── pricing router
├── search router
├── inventory router
├── notifications router
├── communication router
├── documents router
├── loyalty router
├── quality router
├── sustainability router
├── automation router
├── monetization router
├── migration router
├── auth middleware
├── rate limiting middleware
└── monitoring services
```

---

## 4. Service Import Matrix

| Component | ai | search | pricing | docs | inventory | analytics | mobile | payments |
|-----------|-----|--------|---------|------|----------|----------|--------|----------|
| Routes | ✓ | ✓ | ✓ | - | - | - | - | - |
| AI Planner | ✓ | - | - | - | - | - | - | - |
| Search Page | - | ✓ | - | - | - | - | - | - |
| Booking Flow | - | - | ✓ | ? | ? | - | - | ✓ |
| Admin | - | - | - | ? | ? | ? | - | - |

Legend: ✓ Used, - Not used, ? Uncertain

---

## 5. Unused Component List

### 5.1 Admin Components (9)
```
components/admin/
├── AdminAITools.tsx
├── BookingManager.tsx
├── CMSDashboard.tsx
├── ContentManager.tsx
├── CustomerManager.tsx
├── MarketingCenter.tsx
├── PageBuilder.tsx
├── SettingsPanel.tsx
└── SupplierManager.tsx
```

### 5.2 Common Components (8)
```
components/common/
├── DataTable.tsx
├── DropdownMenu.tsx
├── LoadingSpinner.tsx
├── LuxuryCTABanner.tsx
├── NotificationToast.tsx
├── PageHero.tsx
├── SectionHeader.tsx
└── TrustBadges.tsx
```

### 5.3 Other Components (15)
```
components/ai/AIChat.tsx
components/analytics/AnalyticsDashboard.tsx
components/analytics/ExecutiveDashboard.tsx
components/analytics/RoleDashboard.tsx
components/blocks/BlockRenderer.tsx
components/home/LuxuryHero.tsx
components/marketing/BlogCMS.tsx
components/navigation/PageFooterNav.tsx
components/navigation/StickySectionNav.tsx
components/seo/LocalBusinessSEO.tsx
components/supplier/SupplierBookings.tsx
components/supplier/SupplierAvailability.tsx
components/supplier/SupplierFinancialDashboard.tsx
components/supplier/SupplierPricing.tsx
components/supplier/SupplierRegistration.tsx
```

---

## 6. External Dependencies

### 6.1 Google Services
- **Gemini AI:** Used for AI Safari Planner
- **Google Maps:** Embedded in InteractiveMap

### 6.2 Payment Providers
- **Stripe:** Payment processing
- **M-Pesa:** Mobile payments (Kenya)

### 6.3 External APIs
- None identified

---

## 7. Configuration Dependencies

### 7.1 Required Environment Variables

| Variable | Used By | Required |
|----------|---------|----------|
| DATABASE_URL | db/index.ts | Yes |
| JWT_SECRET | auth/index.ts | Yes |
| GEMINI_API_KEY | server.ts | Yes |
| STRIPE_SECRET_KEY | payments route | Yes |
| ALLOWED_ORIGINS | server.ts | Yes |

### 7.2 Optional Environment Variables

| Variable | Used By | Optional |
|----------|---------|----------|
| VITE_SENTRY_DSN | sentry.tsx | Yes |
| VITE_GA_MEASUREMENT_ID | analytics | Yes |
| SMTP_* | communication | Yes |

---

## 8. Package Dependency Graph

```
@google/genai
├── GoogleGenAI
│   └── Used in: server.ts (AI endpoint)
│
lucide-react
├── Icon components
│   └── Used in: All components with icons
│
motion
├── AnimatePresence
├── motion
│   └── Used in: Animation-heavy components
│
express
├── Rate limiting
├── CORS
├── Helmet
├── Compression
│   └── All used in: server.ts
│
pg
├── Pool
├── Query
│   └── Used in: db/index.ts
│
stripe
├── Stripe instance
│   └── Used in: payments route
│
tailwindcss
├── All styled components
│   └── Used in: All .tsx files
```

---

## 9. Circular Dependency Check

### 9.1 Potential Circular Dependencies

```
context/AppContext.tsx
├── Used by: Most components
└── Imports: None (provides context only)

utils/sentry.tsx
├── Used by: App.tsx
└── Imports: React

services/monitoring/
├── Used by: server.ts
└── No circular imports detected
```

---

## 10. Unused Code Statistics

| Category | Total | Used | Unused | Percentage |
|----------|-------|------|--------|------------|
| Components | 136 | 104 | 32 | 24% |
| Services | 15 | 10 | 5 | 33% |
| Hooks | 1 | 0 | 1 | 100% |
| Routes | 23 | 23 | 0 | 0% |

---

**Report Generated:** 2026-07-27
