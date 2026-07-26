# IDENT AFRICA - Database Migrations

This directory contains all database migrations, seeds, and configuration for IDENT AFRICA.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema/      # Base schema definitions
│   ├── 002_security/            # Security-related migrations
│   ├── 003_rls/                  # Row Level Security policies
│   └── 004_verification/         # Integrity verification scripts
├── seed/
│   └── 001_default_content.sql   # Default seed data
└── functions/                   # Database functions/triggers
```

## Migration Order

1. **001_initial_schema** - Core tables (destinations, users, suppliers, bookings, etc.)
2. **002_security** - Roles, permissions, audit logging
3. **003_rls** - Row Level Security policies
4. **004_verification** - Integrity checks

## Running Migrations

### Local Development (with Supabase CLI)

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Or apply specific migration
supabase db push
```

### Production

```bash
# Using Supabase CLI
supabase db push --project-id <your-project-id>

# Or via SQL Editor in Supabase Dashboard
# Copy and paste migration files in order
```

## Seed Data

Default content is loaded from `seed/001_default_content.sql`:

- 5 Premium destinations (Serengeti, Masai Mara, Ngorongoro, Kruger, Victoria Falls)
- 3 Safari packages
- CMS homepage content
- System demo supplier
- Sample testimonials
- Default content registry entries

## Row Level Security

All sensitive tables have RLS enabled with policies for:

| Role | Access |
|------|--------|
| **Admin** | Full access to all data |
| **Content Manager** | CMS content only |
| **Finance Manager** | Financial data only |
| **Supplier** | Own business data only |
| **Customer** | Own profile and bookings only |

## Verification

Run `004_verification/001_integrity_check.sql` before production to verify:

- ✅ No orphan records
- ✅ No duplicate records
- ✅ No invalid data
- ✅ RLS policies configured
- ✅ Foreign keys intact

## Environment Variables

Required for database connection:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Safety Rules

1. **Never modify existing migrations** - Create new ones instead
2. **Always test locally first** - Use `supabase db reset`
3. **Backup before production changes** - Use Supabase dashboard or CLI
4. **Use transactions** - Wrap destructive changes in transactions
5. **Document changes** - Update this README with migration purpose
