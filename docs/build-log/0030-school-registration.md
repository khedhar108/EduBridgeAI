# 0030 — Public school registration wizard

**Date:** 2026-08-29

## Goal

Let a school founder create a workspace from `/register` and test that path in production, without the Phase 6 billing engine.

## What changed

- Public 3-step wizard: school + India location, founder account, workspace slug
- Email OTP / magic-link proof, then atomic `schools` + first `school_admin`
- Founder `/forgot-password` + `/update-password` (office reset unchanged)
- Marketing CTAs point at Register; staff `/join-school` stays join-only

## Commands

```bash
pnpm db:generate -- --name=school-location
pnpm db:migrate
pnpm --filter edubridge check-types
pnpm lint
```

## Key paths

- `apps/edubridge/features/registration/`
- `apps/edubridge/lib/tenancy/provision-school.ts`
- `packages/db/src/schema/schools.ts`

## Next

Location columns already sit in `packages/db/migrations/0012_fee-demo-select.sql` (same generate as `fee_plans.is_demo`). Ask permission, then `pnpm db:migrate`. In Supabase Auth, add `/auth/callback` to redirect URLs and set `NEXT_PUBLIC_SITE_URL`. Trial/plans remain Phase 6.2.
