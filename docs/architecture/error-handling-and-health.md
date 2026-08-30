# Error Handling, 404, and Health Checks

> Cross-cutting status/error infrastructure for `apps/edubridge`. Covers the global 404 page, App Router error boundaries, the centralized HTTP error module, and the health-check endpoint + dev dashboard.

## Scope

This doc explains **where** each status surface lives and **why** it is shaped that way. It is the Next.js App Router analog of an Express backend's single error-handling middleware file — a small set of shared rules instead of ad-hoc try/catch in every controller.

## File map

```
apps/edubridge/
  app/
    not-found.tsx        # global 404 (thin server component)
    error.tsx            # segment runtime error boundary ("use client")
    global-error.tsx     # root runtime error boundary ("use client")
    api/health/route.ts  # GET /api/health — aggregate status + DB check
    api/live/route.ts    # GET /api/live — liveness, no database
    status/page.tsx      # dev-only status dashboard (server gate + client view)
  features/shell/components/
    not-found-screen.tsx # animated 404 (server component, CSS motion)
    error-screen.tsx     # reusable status-coded error screen
    status-dashboard.tsx # client dashboard that fetches /api/health
  lib/
    http.ts              # HttpError + errorResponse + withRouteHandler (the "rules" file)
    health.ts            # checkDatabaseHealth()
```

## 1. Global 404

A root-level `app/not-found.tsx` is the **automatic global 404** for the entire app. It catches:

- unmatched URLs (e.g. `/nope`),
- `notFound()` thrown from any Server Component/action,
- invalid dynamic params.

The existing tenant guards already call `notFound()` (`app/[workspace]/layout.tsx` and `page.tsx`), so invalid workspace slugs render this same screen.

**Structure rule:** `app/not-found.tsx` stays a thin server component. All visuals live in `features/shell/components/not-found-screen.tsx`. The animation is CSS-only (floating "404" + drop mark) and gated by `@media (prefers-reduced-motion: reduce)` so it paints fast with zero client JS and can be upgraded (framer-motion/Lottie) later without touching the route file.

## 2. Runtime error boundaries

A global 404 does **not** catch runtime exceptions inside a `layout.tsx`/`page.tsx`. For those, Next.js needs error boundaries:

| File | Scope | Behavior |
|------|-------|----------|
| `app/error.tsx` | Nested route errors | Renders `ErrorScreen`, exposes `reset()` as "Try again" |
| `app/global-error.tsx` | Root layout errors | Must render its own `<html>` + `<body>` |

Both are `"use client"` and import `ErrorScreen` **directly** from `features/shell/components/error-screen` (not the `@/features/shell` barrel). Importing the barrel into a client error boundary drags server-only modules (`next/headers`, `postgres`) into the client bundle.

## 3. Centralized HTTP error module (`lib/http.ts`)

One file with the shared rules, imported by route handlers:

- `HttpError` — `extends Error`, carries `status`, `code`, optional `details`.
- `errorResponse(error)` — maps a thrown value to a consistent JSON `Response`.
  - Next.js `redirect`/`notFound` sentinels (`NEXT_REDIRECT` / `NEXT_NOT_FOUND`) are re-thrown untouched.
  - `HttpError` → its status + structured body.
  - Unknown error → `console.error` server-side, return generic 500 (never leak the stack).
- `withRouteHandler(handler)` — HOF that wraps a route handler so throws become normalized responses.
- `ok(data)` — success envelope helper.

**Envelope:**

```json
{ "ok": true, "data": {} }
{ "ok": false, "error": { "status": 500, "code": "INTERNAL", "message": "..." } }
```

Existing route handlers/actions are **not** retrofitted in this change. Adopting `withRouteHandler` (and a future `withAction`) is a follow-up.

## 4. Health checks

### Endpoint

`GET /api/live` is liveness only (`{ "status": "ok" }`, no database). Docker and
Coolify probes use this so a slow Postgres does not kill the container.

`GET /api/health` returns an aggregate, following Kubernetes-style readiness semantics:

```json
{
  "status": "ok",
  "timestamp": "2026-08-27T00:00:00.000Z",
  "uptime": 123,
  "checks": {
    "database": { "status": "ok", "latencyMs": 12 }
  }
}
```

- `status` = `ok` when all required checks pass, `degraded` otherwise.
- HTTP `200` when healthy, `503` when a required check fails.
- `Cache-Control: no-store`.
- Unauthenticated by design (probes cannot send cookies); it leaks only `ok`/latency, no data.

### Database check

`lib/health.ts` → `checkDatabaseHealth()` runs `select 1` on the Drizzle pool with a 3s timeout and measures latency. The `error` detail is surfaced **only** when `NODE_ENV !== "production"`.

The reachability chain is: **front end → `/api/health` → `select 1` → Postgres**.

## 5. Dev-only status dashboard

`app/status/page.tsx` is the developer debugging surface. It:

- calls `notFound()` when `NODE_ENV === "production"` (dev-only),
- fetches `/api/health` and shows API round-trip, HTTP status, DB status + latency, and a "Re-check" button.

This is intentionally **lighter** than the existing `app/db-check/page.tsx`, which performs a real schema query and verifies seed data. `/status` proves reachability; `/db-check` proves the schema is populated.

## Design constraints

- Light-only semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `text-primary`, `text-destructive`).
- `prefers-reduced-motion` disables the 404 animation.
- Feature-folder rule: route files stay thin; presentational components live in `features/shell/`.

## Related

- [Shell layout](../design/shell-layout.md) — routes inside vs. outside the workspace shell.
- [Data access](./data-access.md) — Drizzle/RLS/`withTenant`.
- [Monorepo](./monorepo.md) — apps/packages layout.
