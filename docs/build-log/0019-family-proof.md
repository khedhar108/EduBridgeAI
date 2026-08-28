# 0019 — Family proof (match + cookie)

**Date:** 2026-08-28

## Goal

Headless family door: admission + DOB match against the roster, HMAC `edubridge.family` cookie, isolated from staff `getSessionContext`. No family page.

## What changed

- `matchStudentForFamily` resolves school from URL slug only; generic miss; rate-limit IP + admission + slug.
- Family cookie module (HMAC like impersonation, origin-aware Path, sliding ~30d, `FAMILY_SESSION_SECRET`).
- `getSessionContext` documents that it never reads the family cookie.
- Seed tests: Pilot `EBS-2024-006` / `2013-06-06`, wrong DOB, Oakwood isolation, cookie vs staff context.
- Docs: family-access, strategy (not Phase 5–6), mobile-app (first-party cookie, `/family` start_url/scope).

## Commands

```bash
pnpm --filter @repo/db test:family-match
pnpm --filter edubridge lint
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/lib/tenancy/match-student-for-family.ts`
- `apps/edubridge/lib/tenancy/family-session.ts`
- `packages/db/scripts/test-family-match.ts`
- `docs/architecture/auth/family-access.md`

## Next

Phase 1 family form on `/{slug}/family`. `proxy.ts` family allow-list is owned with staff workspace sign-in.
