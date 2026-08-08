# 0004 — Database workflow

**Date:** 2026-08-07

## Goal

Lock the daily DB workflow so future table changes never need force-pushes or drift fixes.

## What changed

- Added `docs/guides/database-workflow.md` — canonical commands, NOT-NULL patterns, dev/prod URLs, Supabase branch/dev-project guidance; linked from `docs/guides/README.md`, root `README.md`, `packages/db/README.md`.
- `drizzle.config.ts` prefers `MIGRATION_DATABASE_URL` (session pooler :5432) with `DATABASE_URL` fallback; `.env.example` documents both.
- Added root `pnpm db:push` (scratch DBs only).
- Created gitignored `packages/db/.env` with password placeholders.
- Home page shows a dev-only "Check database connection" button → `/db-check`.

## Commands

```bash
pnpm db:generate -- --name=<change>
pnpm db:migrate
pnpm seed:dev
pnpm lint && pnpm check-types && pnpm build
```

## Key paths

- `docs/guides/database-workflow.md`
- `packages/db/drizzle.config.ts`, `packages/db/.env`
- `apps/edubridge/app/page.tsx`

## Next

User pastes the real DB password into `packages/db/.env`, runs `pnpm db:migrate` + `pnpm seed:dev`, then verifies at `/db-check` and Supabase Table Editor.
