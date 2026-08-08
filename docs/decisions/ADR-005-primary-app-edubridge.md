# ADR-005: Primary app is `apps/edubridge`

**Status:** Accepted  
**Date:** 2026-08-06

## Context

The monorepo shipped with `apps/web` as a Mastra + Next.js starter (Aria template). EduBridge needs a dedicated product surface with feature folders, roles, and `@repo/db`, without discarding the working Mastra demo.

## Decision

- **`apps/edubridge`** is the primary product Next.js app (port **3000**).
- **`apps/web`** remains the Mastra starter/demo (port **3002**).
- Shared data access lives in **`packages/db`** (`@repo/db`), consumed by the product app (and later agent tools).

## Consequences

- Phase 0+ feature folders, shell, and auth land under `apps/edubridge/`.
- Root `pnpm dev` targets `edubridge` + agent, not `web`.
- Docs and Cursor rules that said `apps/web` for product work now say `apps/edubridge`.

## References

- [docs/build-log/0002-db-and-edubridge-app.md](../build-log/0002-db-and-edubridge-app.md)
- [docs/architecture/data-access.md](../architecture/data-access.md)
