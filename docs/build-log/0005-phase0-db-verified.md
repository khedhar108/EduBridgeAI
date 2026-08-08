# 0005 — Phase 0.1–0.2 verified on dev

**Date:** 2026-08-08

## Goal

Confirm dev Supabase wiring end-to-end and mark Phase 0 milestones so agents skip redo work.

## What changed

- `pnpm db:migrate` applied `0000_phase0_core.sql` to dev project `EduDatabase`
- `pnpm seed:dev` upserted EduBridge Pilot School
- `/db-check` connected; Supabase Schema Visualizer shows `schools`, `profiles`, `school_members`
- Updated `docs/roadmap/phase-0-foundation.md` progress tracker + milestone checkboxes
- Roadmap index: Phase 0 status → **0.3 auth next**

## Commands

```bash
pnpm db:migrate
pnpm seed:dev
pnpm dev:edubridge   # http://localhost:3000/db-check
```

## Key paths

- `docs/roadmap/phase-0-foundation.md` — agent progress tracker
- `packages/db/migrations/0000_phase0_core.sql`

## Next

Phase **0.3** — Supabase SSR auth, sign-in routes, `getSessionContext()`. Do not re-run migrate unless schema changes.
