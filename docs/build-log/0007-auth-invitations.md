# 0007 — Auth + invitations

**Date:** 2026-08-08

## Goal

Wire Phase 0.3 auth surfaces and invite-only membership; keep Phase 0 progress checkboxes accurate.

## What changed

- Premium home + school/platform sign-in, `proxy.ts`, `getSessionContext`
- `invitations` schema + `0001_invitations.sql` (RLS for school_admin)
- Invite/accept actions + `/accept-invite/[token]` + team settings page
- Phase 0 roadmap checkboxes + next-steps list updated
- Public Supabase env keys added to `.env.local` (with existing `DATABASE_URL`)

## Commands

```bash
pnpm --filter @repo/db db:migrate
pnpm --filter edubridge check-types
python scripts/phase0_progress.py
```

## Key paths

- `docs/roadmap/phase-0-foundation.md`
- `packages/db/migrations/0001_invitations.sql`
- `apps/edubridge/features/auth/`

## Next

Bootstrap one pilot `school_admin` auth user; smoke sign-in; then shell chrome (0.4).
