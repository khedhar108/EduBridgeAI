# 0035 — TanStack Query infra + username check

**Date:** 2026-09-02

## Goal

Wire `@tanstack/react-query` (already catalog 5.102.7) as the client cache and move username availability off hand-rolled `useEffect`.

## What changed

- Added `apps/edubridge/lib/query/` (client, provider, keys, types, errors, island).
- Mounted `QueryProvider` inside existing `Providers` (RSC children unchanged).
- `UsernameField` uses debounced `useQuery` → existing `checkUsernameAction`. Drizzle schemas and other features untouched.

## Commands

```bash
pnpm --filter edubridge check-types
pnpm lint
```

## Key paths

- `apps/edubridge/lib/query/`
- `apps/edubridge/features/auth/hooks/use-username-check.ts`
- `apps/edubridge/features/auth/components/username-field.tsx`
- `docs/guides/tanstack-query-adoption.md`

## Next

Browser-confirm username, then attendance mutation only.
