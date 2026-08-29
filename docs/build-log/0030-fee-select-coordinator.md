# 0030 — Coordinator fee SELECT + demo flag

**Date:** 2026-08-29

## Goal

Let Control Hub grant coordinator `fees.view` honestly, and persist the demo-starter flag on the plan.

## What changed

- `fee_plans.is_demo` (default false); first demo publish sets it, next version clears it
- Fee SELECT policies include `coordinator`; write policies unchanged (admin|accountant)
- Hub `fees.view` unlocked for coordinator (default still off)
- Generated `0012` also applied pending `schools` address columns already in schema (`country`/`state`/`city`/`pincode`)

## Commands

```bash
pnpm db:generate -- --name=fee-demo-select
pnpm db:migrate
pnpm db:check
```

## Key paths

- `packages/db/src/schema/fees.ts`
- `packages/db/migrations/0012_fee-demo-select.sql`
- `apps/edubridge/lib/auth/capabilities.ts`
- `docs/wayfinder/control-hub.md`

## Next

Slice 3b: write RLS split before Hub `fees.collect` / `fees.structure` for coordinator.
