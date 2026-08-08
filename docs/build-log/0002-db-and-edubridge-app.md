# 0002 — `@repo/db` + `apps/edubridge` scaffold

**Date:** 2026-08-06

## Goal
Land portable Drizzle package and primary product Next.js app so Phase 0 can start.

## What changed
- Created `packages/db` (`@repo/db`): multi-file schema barrel, `getDb()` / `withTenant()`, drizzle-kit config, `.env.example`.
- Created `apps/edubridge` (port 3000): Tailwind + `@repo/ui`, Mastra client gateway, `features/shell` registry, `@repo/db` dependency.
- Moved `apps/web` demo to port 3002; root `pnpm dev` → edubridge + agent.
- ADR-005; docs/rules retargeted to `apps/edubridge`.

## Commands
```bash
pnpm install
pnpm --filter @repo/db check-types
pnpm --filter edubridge check-types
pnpm lint
pnpm check-types
pnpm build
```

## Key paths
- `packages/db/`
- `apps/edubridge/`
- `docs/decisions/ADR-005-primary-app-edubridge.md`

## Next
Phase 0.1 — define schools/profiles/school_members schema + RLS migrations in `@repo/db`.
