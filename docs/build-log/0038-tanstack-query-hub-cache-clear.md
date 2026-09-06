# 0038 — TanStack Query hub + cache clear

**Date:** 2026-09-04

## Goal

Finish the planned TQ surfaces: Control Hub mutation and cache wipe on identity change.

## What changed

- `useSetHubFlag` around existing `setHubFlagAction`; confirm-dialog logic unchanged.
- `CacheClearForm` calls `queryClient.clear()` on sign-out and impersonation start/stop.

## Commands

```bash
pnpm --filter edubridge exec eslint features/auth/hooks/use-set-hub-flag.ts features/auth/components/control-hub-matrix.tsx lib/query/clear-form.tsx lib/query/client.ts
```

## Key paths

- `apps/edubridge/features/auth/hooks/use-set-hub-flag.ts`
- `apps/edubridge/lib/query/clear-form.tsx`

## Next

Manual check: Hub switch, sign-out, impersonate start/stop.
