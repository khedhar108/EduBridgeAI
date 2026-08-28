# 0017 — Global 404, Error Boundaries, and Health Checks

**Date:** 2026-08-27

## Goal

Add cross-cutting status/error infrastructure: a global 404 page, App Router error boundaries, a centralized HTTP error module, and health checks (front end → back end → database).

## What changed

- Added global `app/not-found.tsx` + `features/shell/components/not-found-screen.tsx` (CSS-only floating animation, `prefers-reduced-motion` aware).
- Added `app/error.tsx` + `app/global-error.tsx` + `features/shell/components/error-screen.tsx` for runtime failures.
- Added `lib/http.ts` (`HttpError`, `errorResponse`, `withRouteHandler`, `ok`) as the single shared error/status module.
- Added `lib/health.ts` (`checkDatabaseHealth`) + `GET /api/health` route (200 healthy / 503 degraded, `Cache-Control: no-store`).
- Added dev-only `app/status/page.tsx` + `features/shell/components/status-dashboard.tsx` for reachability debugging.
- Exported the new shell components from `features/shell/index.ts`.
- Documented the structure in `docs/architecture/error-handling-and-health.md`.

## Commands

```bash
pnpm --filter edubridge check-types
pnpm --filter edubridge lint
pnpm --filter edubridge build
```

## Key paths

- `apps/edubridge/app/not-found.tsx`
- `apps/edubridge/app/error.tsx`
- `apps/edubridge/app/global-error.tsx`
- `apps/edubridge/app/api/health/route.ts`
- `apps/edubridge/app/status/page.tsx`
- `apps/edubridge/lib/http.ts`
- `apps/edubridge/lib/health.ts`
- `apps/edubridge/features/shell/components/{not-found-screen,error-screen,status-dashboard}.tsx`
- `docs/architecture/error-handling-and-health.md`

## Next

Retrofit existing route handlers/server actions onto `withRouteHandler` / a future `withAction` wrapper.
