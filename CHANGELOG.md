# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-07-25 - Production Hardening

### Added
- **Dynamic Pricing Engine**
  - Pricing rules database with entity-based pricing
  - Base price, season pricing, weekend pricing, peak season support
  - Discounts and promotions system
  - Admin campaign management controls
  - Supplier approved pricing management

- **Security & Permissions (Phase C)**
  - Row Level Security (RLS) policies
  - Role-based access control (6 roles)
  - API permission scopes
  - Storage access controls
  - Audit logging system
  - Rate limiting

- **Content Migration System (Phase D)**
  - Content status tracking (DEFAULT, DRAFT, PUBLISHED, ARCHIVED)
  - Content ownership (system, admin, supplier)
  - Bulk publish/unpublish/archive operations
  - Image replacement tools
  - Migration history and audit trails

- **Quality Assurance (Phase E)**
  - Comprehensive test suites (115 tests)
  - User journey tests (16 tests)
  - Supplier journey tests (20 tests)
  - Admin journey tests (26 tests)
  - Performance tests (22 tests)
  - Integration tests (16 tests)
  - Production checklist

- **Environment Configuration (Phase 16)**
  - Complete `.env.example` with all variables
  - Configuration service (`src/config/`)
  - Client-side config (`src/config/client.ts`)
  - Vercel security headers

- **Database Preparation (Phase 17)**
  - Row Level Security policies
  - Production seed data (5 destinations, 3 packages)
  - Migration folder structure (`supabase/`)
  - Integrity verification scripts

- **Vercel Deployment (Phase 18)**
  - Optimized build configuration
  - SPA routing in `vercel.json`
  - Asset optimization and chunking
  - Enhanced deployment guide

- **GitHub Repository (Phase 19)**
  - Professional README with architecture
  - CONTRIBUTING guidelines
  - Issue templates
  - GitHub workflows

### Changed
- `vite.config.ts` - Enhanced production optimization
- `package.json` - Improved build scripts
- `vercel.json` - Enhanced security headers
- `DEPLOYMENT.md` - Comprehensive deployment guide

---

## [1.0.0] - 2026-01-25 - Initial Production Release

### Added
- **Core Application**
  - Complete React 19 frontend with TypeScript
  - Express.js backend server
  - Vite build system
  - Tailwind CSS 4 styling

- **Features**
  - AI Safari Concierge (Gemini-powered trip planner)
  - Destination explorer with 4 East African countries
  - Luxury lodge listings and booking
  - Visual itinerary builder
  - Trip comparator
  - Booking system with multiple payment gateways
  - Supplier portal for partners
  - Admin dashboard with statistics
  - Multi-currency support (USD, EUR, GBP, KES)
  - Real-time exchange rates

- **User Experience**
  - Responsive mobile-first design
  - Dark/light theme support
  - Loading states and error handling
  - Toast notifications
  - Empty states
  - Search and filter functionality

- **Security**
  - JWT-based authentication
  - Helmet.js security headers
  - CORS configuration
  - Input validation and sanitization
  - XSS protection
  - Secure API responses

- **Deployment**
  - Vercel configuration
  - Docker support
  - Environment variable management
  - Database schema (PostgreSQL-ready)

### Payment Gateways
- Stripe integration
- Flutterwave (Pan-African payments)
- M-Pesa (Kenyan mobile payments)
- Refund workflow system

### Pages
- Home (hero, featured destinations, testimonials)
- Destinations listing and detail
- Hotels/lodges listing and detail
- Hotel comparator
- Itineraries showcase
- Visual itinerary builder
- Trip comparator
- AI concierge planner
- User dashboard
- Admin dashboard
- Supplier portal
- Booking history

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/exchange-rates` - Live exchange rates
- `POST /api/payments/stripe/create-intent` - Stripe payments
- `POST /api/payments/flutterwave/charge` - Flutterwave payments
- `POST /api/payments/mpesa/stk-push` - M-Pesa payments
- `POST /api/refunds/process` - Refund workflow
- `POST /api/ai-planner` - AI trip planning
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - User logout
- `GET /api/admin/stats` - Admin statistics
- `GET /api/db/health` - Database health

---

## [0.1.0] - 2025-12-01 - Development Start

### Added
- Initial project structure
- Basic React components
- Mock data setup
- Database schema draft

---

## Upcoming (Planned)

### v1.1.0
- [ ] Real database integration
- [ ] Email verification
- [ ] Password reset flow
- [ ] Advanced search with filters
- [ ] User profile management

### v1.2.0
- [ ] Review and rating system
- [ ] Wishlist sharing
- [ ] Social login (Google, Facebook)
- [ ] Push notifications

### v2.0.0
- [ ] Real-time chat with rangers
- [ ] Augmented reality wildlife identification
- [ ] Multi-language support
- [ ] Mobile app
