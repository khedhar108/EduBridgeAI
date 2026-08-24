# 0014 — Phase 0 exit: RLS runner, ADR-007, second school

**Date:** 2026-08-15

## Goal

Close out the remaining Phase 0 exit items: run the RLS isolation test against dev, record the email-auth method ADR, and expand the seed to a second school for live cross-tenant checks.

## What changed

- Added `db:rls-test` runner (`packages/db/scripts/run-rls-test.mjs`) that executes `tests/rls-isolation.sql` via the `postgres` driver and surfaces DO-block assertion failures. Ran green against dev: Alpha user sees 1 school, 1 membership; cross-tenant update blocked. The test is self-contained (creates + rolls back its own fixtures), so it does not depend on `pnpm seed:dev`.
- Wrote [ADR-007](../decisions/ADR-007-email-auth-password.md): email + password is the Phase 0 baseline auth method; email OTP/magic link stays additive for later passwordless parent access. Indexed in `docs/decisions/README.md`.
- Extended `packages/db/src/seed.ts` to a second school ("Oakwood Academy", slug `oakwood-academy-bridge`, domain `oakwood.edu`); ran `pnpm seed:dev` — both schools present. Auth users still created out-of-band (seed inserts DB rows only).
- `pnpm lint` + `pnpm check-types` green from root.

## Commands

```bash
pnpm --filter @repo/db db:rls-test
pnpm seed:dev
pnpm lint
pnpm check-types
```

## Key paths

- `packages/db/scripts/run-rls-test.mjs`
- `packages/db/tests/rls-isolation.sql`
- `packages/db/src/seed.ts`
- `docs/decisions/ADR-007-email-auth-password.md`

## Next

Manual e2e smoke tests (invite outsider activate; domain-join pending→approve→sign-in) and a green `pnpm build`, then flip Phase 0 to Done and open Phase 1. Both smoke tests need a live browser against Supabase Auth with the seeded admin account.
