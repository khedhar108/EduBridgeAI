# 0003 — Phase 0 core database (local)

**Date:** 2026-08-07

## Goal

Prepare the reviewed core schema, RLS, pilot seed, and connection probe without
changing the remote Supabase project.

## What changed

- Added split Drizzle schemas for roles, schools, profiles, memberships, and relations.
- Generated `0000_phase0_core.sql`; appended Auth FK, grants, private RLS helpers, and policies.
- Added rollback-only cross-school isolation SQL and idempotent pilot-school seed.
- Added development-only `/db-check` to show connection status and school names.
- Corrected `withTenant()` to `SET LOCAL ROLE authenticated` so RLS executes.

## Commands

```bash
pnpm db:generate
pnpm lint
pnpm check-types
pnpm build
pnpm db:migrate # next: only after approval + real DATABASE_URL
pnpm seed:dev   # next: after migration
```

## Key paths

- `packages/db/src/schema/`
- `packages/db/migrations/0000_phase0_core.sql`
- `packages/db/src/seed.ts`
- `packages/db/tests/rls-isolation.sql`
- `apps/edubridge/app/db-check/page.tsx`
- `docs/architecture/multi-tenancy.md`

## Next

Review the SQL, then explicitly approve remote migration + seed; auth users and
all-role seed fixtures remain Phase 0.3–0.5.
