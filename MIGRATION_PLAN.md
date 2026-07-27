# IDENT AFRICA - Production Migration Plan

## Current State: 78/100

### Missing Components:
- Database connection layer
- Real CRUD APIs
- bcrypt password hashing
- Booking lifecycle
- Payment workflows
- Supplier approval
- Testing infrastructure

---

## Migration Roadmap

### Phase 1: Database Layer (Priority: Critical)
**Impact: Foundation for all other work**

Files to create:
- `src/db/index.ts` - PostgreSQL connection pool
- `src/db/migrations/` - Migration scripts

Tables to add:
- `lodges` - Hotel/accommodation data
- `itineraries` - Safari packages
- `booking_addons` - Optional extras
- `payment_transactions` - Payment tracking
- `audit_logs` - Security audit trail

### Phase 2: REST API Layer (Priority: High)
**Impact: Backend capability**

Endpoints to create:
```
/api/destinations/* - CRUD operations
/api/lodges/* - CRUD operations  
/api/itineraries/* - CRUD operations
/api/bookings/* - Full lifecycle
/api/users/* - User management
```

### Phase 3: Authentication Upgrade (Priority: Critical)
**Impact: Security**

Changes:
- bcrypt for password hashing
- Refresh tokens
- Session management
- Password reset flow

### Phase 4: Booking & Payments (Priority: High)
**Impact: Core business logic**

Features:
- Booking creation with validation
- Payment initiation and confirmation
- Refund workflow
- Email notifications

### Phase 5: Admin CMS (Priority: Medium)
**Impact: Manageability**

Features:
- Real statistics from database
- User management
- Content management
- Analytics dashboard

### Phase 6: Supplier Workflow (Priority: Medium)
**Impact: Partner onboarding**

Features:
- Application submission
- Admin approval
- Status tracking
- Document upload

### Phase 7: Testing (Priority: Low)
**Impact: Reliability**

Setup:
- Vitest configuration
- Unit tests for utilities
- API integration tests

---

## Implementation Order

1. Database connection (`db.ts`)
2. Extended schema with missing tables
3. CRUD API for destinations
4. CRUD API for lodges
5. CRUD API for itineraries
6. User registration with bcrypt
7. Booking CRUD
8. Payment integration
9. Admin endpoints
10. Supplier workflow
11. Testing setup

---

## Backward Compatibility

The migration must:
- Work without DATABASE_URL (fallback to mock data)
- Maintain existing API contracts
- Not break existing frontend

---

## Success Criteria

- [ ] All mock data replaced with database queries
- [ ] All CRUD operations working
- [ ] bcrypt password hashing
- [ ] Complete booking flow
- [ ] Payment gateway integration
- [ ] Admin CMS functional
- [ ] Tests passing
