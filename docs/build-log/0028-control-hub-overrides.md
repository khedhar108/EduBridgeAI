# 0028 — Control Hub capability overrides

**Date:** 2026-08-29

## Goal

Persist school-admin permission flags on the school row and apply the column on EduDatabase.

## What changed

- `schools.capability_overrides` jsonb (default `{}`)
- `can()` merges overrides; Hub Switches save for flags Postgres already honours
- Dedicated page `/{slug}/settings/control` writes `admin_audit_events`

## Commands

```bash
pnpm db:generate -- --name=capability-overrides
pnpm db:migrate
pnpm db:check
```

## Key paths

- `packages/db/src/schema/schools.ts`
- `packages/db/migrations/0011_capability-overrides.sql`
- `apps/edubridge/lib/auth/capabilities.ts`
- `apps/edubridge/app/[workspace]/(staff)/settings/control/page.tsx`

## Next

Slice 3a: coordinator fee SELECT + `is_demo` — see [0030](./0030-fee-select-coordinator.md).
Slice 3b: write RLS so coordinator `fees.collect` is honest.
