# 0008 — Domain join pending activation

**Date:** 2026-08-08

## Goal

School-domain emails can request access; school_admin activates from the team dashboard (option 1).

## What changed

- `membership_requests` table + RLS (`0002_membership_requests.sql`)
- `/join-school` sign-up; post-login domain match upserts pending request
- Team settings: pending queue activate/reject + existing invites
- RBAC docs: dual grant paths (invite + domain→activate)

## Commands

```bash
pnpm --filter @repo/db db:migrate
pnpm --filter edubridge check-types
```

## Key paths

- `packages/db/src/schema/membership-requests.ts`
- `apps/edubridge/lib/tenancy/domain-join.ts`
- `apps/edubridge/app/[workspace]/settings/team/page.tsx`

## Next

Bootstrap pilot school_admin; smoke domain join + activate.
