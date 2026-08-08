# 0001 — Pre–Phase 0 bootstrap

**Date:** 2026-08-06

## Goal
Start durable build memory and lock bootstrap decisions before scaffolding Drizzle + the primary app.

## What changed
- Added `docs/build-log/` journal + Cursor rule `50-build-log.mdc`.
- Confirmed Supabase org **Edubridge**, project **EduDatabase** (`xzqxehyjkftzkllmgcwq`, `ap-south-1`).
- Locked: primary app = `apps/edubridge` (port 3000); `apps/web` stays Mastra starter/demo (port 3002); DB = `packages/db` (`@repo/db`).

## Commands
```bash
# (later in this bootstrap)
pnpm install
pnpm --filter @repo/db check-types
pnpm --filter edubridge dev
```

## Key paths
- `docs/build-log/README.md`
- `.cursor/rules/50-build-log.mdc`
- Planned: `packages/db`, `apps/edubridge`

## Next
Scaffold `@repo/db` (Drizzle, multi-file schema), then `apps/edubridge` with Tailwind/`@repo/ui` + Mastra client.
