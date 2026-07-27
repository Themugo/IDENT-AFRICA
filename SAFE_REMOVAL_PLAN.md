# IDENT AFRICA - Safe Removal Plan

**Document:** Safe code removal guidelines  
**Date:** 2026-07-27  
**Status:** Pending verification

---

## 1. Pre-Removal Checklist

Before removing any code, verify the following:

- [ ] All dependent code has been migrated
- [ ] No active users are affected
- [ ] Backup has been created
- [ ] Rollback plan is documented
- [ ] Tests cover affected functionality
- [ ] Code review approved the removal

---

## 2. Safe Removal Tiers

### Tier 1: Safe to Remove (No Dependencies)

These files have no dependencies and can be removed without testing.

#### 2.1 Hooks
| File | Action | Verification |
|------|--------|--------------|
| `src/hooks/useLazyComponent.tsx` | REMOVE | Grep for usage returns 0 |

**Removal Command:**
```bash
rm src/hooks/useLazyComponent.tsx
```

#### 2.2 Documentation
| File | Action | Archive |
|------|--------|---------|
| `DEPLOYMENT.md` | ARCHIVE | Move to docs/archive/ |
| `SECURITY.md` | ARCHIVE | Move to docs/archive/ |
| `SECURITY_AUDIT.md` | ARCHIVE | Move to docs/archive/ |
| `PRODUCTION_AUDIT.md` | ARCHIVE | Move to docs/archive/ |
| `PRODUCTION_CHECKLIST.md` | ARCHIVE | Move to docs/archive/ |
| `WORKFLOW_AUDIT_REPORT.md` | ARCHIVE | Move to docs/archive/ |
| `LAUNCH_READINESS_REPORT.md` | ARCHIVE | Move to docs/archive/ |

**Removal Commands:**
```bash
mkdir -p docs/archive
mv DEPLOYMENT.md docs/archive/
mv SECURITY.md docs/archive/
mv SECURITY_AUDIT.md docs/archive/
mv PRODUCTION_AUDIT.md docs/archive/
mv PRODUCTION_CHECKLIST.md docs/archive/
mv WORKFLOW_AUDIT_REPORT.md docs/archive/
mv LAUNCH_READINESS_REPORT.md docs/archive/
```

---

### Tier 2: Review Before Removal

These files require dependency verification before removal.

#### 2.3 Common Components

| File | Dependencies | Action |
|------|--------------|--------|
| `components/common/DataTable.tsx` | None found | Review |
| `components/common/DropdownMenu.tsx` | None found | Review |
| `components/common/LoadingSpinner.tsx` | None found | Review |
| `components/common/NotificationToast.tsx` | None found | Review |
| `components/common/PageHero.tsx` | None found | Review |
| `components/common/SectionHeader.tsx` | None found | Review |

**Verification Steps:**
```bash
# Check for dynamic imports
grep -r "DataTable" src --include="*.tsx"
grep -r "DropdownMenu" src --include="*.tsx"
grep -r "LoadingSpinner" src --include="*.tsx"
```

#### 2.4 Navigation Components

| File | Dependencies | Action |
|------|--------------|--------|
| `components/navigation/PageFooterNav.tsx` | None found | Review |
| `components/navigation/StickySectionNav.tsx` | None found | Review |

#### 2.5 Marketing Components

| File | Dependencies | Action |
|------|--------------|--------|
| `components/common/LuxuryCTABanner.tsx` | None found | Review |
| `components/common/TrustBadges.tsx` | None found | Review |

---

### Tier 3: Dependency Verification Required

These files may have hidden dependencies. Verify before removal.

#### 2.6 Documents Service
**Risk:** May be used by booking PDF generation

```bash
# Check for PDF generation usage
grep -r "generatePDF\|pdfExporter" src/routes --include="*.ts"
grep -r "documents" src/routes --include="*.ts"

# If found, check what it imports
cat src/services/documents/index.ts
```

**If documents service is unused:**
```bash
# Backup first
cp -r src/services/documents src/services/documents.backup
# Then remove
rm -rf src/services/documents
```

#### 2.7 Inventory Service
**Risk:** May be used for availability checking

```bash
# Check for inventory usage
grep -r "inventory" src/routes --include="*.ts"
grep -r "availability" src --include="*.ts"

# Check what inventory service exports
cat src/services/inventory/index.ts
```

**If inventory service is unused:**
```bash
cp -r src/services/inventory src/services/inventory.backup
rm -rf src/services/inventory
```

#### 2.8 Analytics Service
**Risk:** External analytics integration

```bash
# Check for analytics usage
grep -r "analytics" src --include="*.ts" --include="*.tsx"
cat src/services/analytics/index.ts
```

#### 2.9 Payments Service
**Risk:** Payment abstraction layer

```bash
# Check for payments service usage
grep -r "services/payments" src --include="*.ts"
ls -la src/services/payments/providers/
```

---

### Tier 4: Complex Dependencies (Do Not Remove)

These files have complex dependencies or may be used for future features.

#### 2.10 Admin Components
| File | Risk | Recommendation |
|------|------|----------------|
| `components/admin/CMSDashboard.tsx` | High | Keep - future CMS |
| `components/admin/PageBuilder.tsx` | High | Keep - duplicate found |
| `components/admin/MarketingCenter.tsx` | Medium | Keep - email automation |
| All other admin components | Medium | Review individually |

#### 2.11 Supplier Components
| File | Risk | Recommendation |
|------|------|----------------|
| `components/supplier/SupplierBookings.tsx` | Medium | Keep - used by portal |
| `components/supplier/SupplierAvailability.tsx` | Medium | Keep - availability |
| `components/supplier/SupplierPricing.tsx` | Medium | Keep - pricing mgmt |
| `components/supplier/SupplierFinancialDashboard.tsx` | Medium | Review |

#### 2.12 SEO Components
| File | Risk | Recommendation |
|------|------|----------------|
| `components/seo/LocalBusinessSEO.tsx` | Medium | Keep - GMB |

#### 2.13 Analytics Components
| File | Risk | Recommendation |
|------|------|----------------|
| `components/analytics/*` | High | Review - admin panel |

---

## 3. Abandoned Feature Removal

### 3.1 AI Chat (Not Planned)
```bash
# If confirmed abandoned:
rm src/components/ai/AIChat.tsx
```

### 3.2 Blog CMS (Not Planned)
```bash
# If confirmed abandoned:
rm src/components/marketing/BlogCMS.tsx
```

### 3.3 Mobile Services (Deprecated)
```bash
# If PWA not needed:
cp -r src/services/mobile src/services/mobile.backup
rm -rf src/services/mobile
```

---

## 4. Removal Execution Plan

### Phase 1: Documentation Cleanup (Day 1)

```bash
# Create archive directory
mkdir -p docs/archive/2026-07-27

# Archive duplicate docs
cd docs/archive/2026-07-27
cp ../../DEPLOYMENT.md .
cp ../../SECURITY.md .
cp ../../SECURITY_AUDIT.md .
cp ../../PRODUCTION_AUDIT.md .
cp ../../PRODUCTION_CHECKLIST.md .
cp ../../WORKFLOW_AUDIT_REPORT.md .
cp ../../LAUNCH_READINESS_REPORT.md .

# Verify copies
ls -la

# Remove from root (after verification)
cd ../..
git add docs/archive/2026-07-27/
git commit -m "docs: archive duplicate documentation"
```

### Phase 2: Hook Cleanup (Day 1)

```bash
# Verify no usage
grep -r "useLazyComponent" src --include="*.tsx" --include="*.ts"

# If no results:
rm src/hooks/useLazyComponent.tsx
git add -A
git commit -m "refactor: remove unused useLazyComponent hook"
```

### Phase 3: Service Verification (Day 2-3)

```bash
# Documents service
grep -r "documents" src/routes --include="*.ts"
# If no usage:
cp -r src/services/documents src/services/documents.backup
# Remove after backup verified

# Inventory service
grep -r "inventory" src/routes --include="*.ts"
# If no usage:
cp -r src/services/inventory src/services/inventory.backup
# Remove after backup verified

# Mobile services
# If PWA not needed:
cp -r src/services/mobile src/services/mobile.backup
# Remove after backup verified
```

### Phase 4: Component Review (Day 4-5)

Review each component in Tier 2 and Tier 3:
1. Check for dynamic imports
2. Check for conditional rendering
3. Check for future feature flags
4. Document any dependencies found
5. Remove only after verification

---

## 5. Rollback Procedures

### If Removal Breaks Build

```bash
# Restore from git
git checkout HEAD -- <removed-file>
npm run build
```

### If Removal Breaks Runtime

```bash
# Full restore from git
git stash
git checkout HEAD -- .
npm run build
npm run dev
```

### If Critical Issue Found

```bash
# Revert the commit
git revert HEAD
npm run build
```

---

## 6. Post-Removal Checklist

After each removal:

- [ ] Run `npm run build` - succeeds
- [ ] Run `npm run dev` - server starts
- [ ] Test key user flows:
  - [ ] Homepage loads
  - [ ] Search works
  - [ ] Booking flow works
  - [ ] Payment processes
- [ ] Check Vercel deployment
- [ ] Monitor error rates

---

## 7. Files to Remove Summary

### Immediate (Safe)
- [ ] `src/hooks/useLazyComponent.tsx`
- [ ] Archive duplicate documentation

### After Verification
- [ ] `src/services/documents/` (if unused)
- [ ] `src/services/inventory/` (if unused)
- [ ] `src/services/mobile/` (if PWA not needed)
- [ ] `src/services/analytics/` (if unused)
- [ ] `src/services/payments/` (if unused)

### Keep (Complex Dependencies)
- [ ] Admin components (future use)
- [ ] Supplier components (active use)
- [ ] SEO components (important)

---

## 8. Estimated Impact

| Category | Files | Impact |
|----------|-------|--------|
| Documentation | 7 files | None (archived) |
| Hooks | 1 file | None |
| Services | 5 services | Low-Medium |
| Components | 32 files | Medium |
| **Total** | ~45 items | **~50KB savings** |

---

## 9. Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering Lead | | | |
| QA Lead | | | |
| Product Owner | | | |

---

**Document Status:** Draft - Awaiting Review  
**Next Update:** After dependency verification
