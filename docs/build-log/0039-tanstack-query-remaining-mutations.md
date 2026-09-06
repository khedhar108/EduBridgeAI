# 0039 — TanStack Query remaining client mutations

**Date:** 2026-09-04

## Goal

Convert leftover `useActionState` / `startTransition` forms to the same TQ island + `useActionMutation` pattern as payment and attendance.

## What changed

- Shared `useActionMutation` (tenant invalidate, `retry: 0`, rethrow `NEXT_REDIRECT`, optional cache clear).
- Publish fee plan, class events, staff directory, pending joins, provision, password reset, sign-in family/domain, registration wizard + OTP.
- Slug availability uses the username-style debounced `useQuery`.
- Child switcher clears the TQ cache like impersonation.

## Commands

```bash
pnpm --filter edubridge exec eslint apps/edubridge/lib/query apps/edubridge/features/fees/hooks apps/edubridge/features/auth/hooks apps/edubridge/features/registration
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/lib/query/use-action-mutation.ts`
- `apps/edubridge/lib/query/keys.ts`
- `apps/edubridge/features/*/hooks/use-*.ts`
- `docs/guides/tanstack-query-adoption.md`

## Next step

Confirm in the browser: sign-in, publish a fee plan, staff role toggle, register slug check. DevTools console filter `tq`.
