# 0029 — Visual fee structures

**Date:** 2026-08-29

## Goal

Replace JSON fee-head editing with a visual studio, version timeline, and Hub-aware Fees nav — without rewriting pinned enrollments.

## What changed

- Structures: labeled heads, live ₹ total, share bars, demo starter, per-plan timeline
- Scholarship payable preview on register/collections (assignment-level, not retroactive)
- `modulesForSession` filters nav with `can()`; Register/Collections tabs follow `fees.collect`
- Coordinator `fees.view` Hub switch still locked until fee SELECT RLS includes them

## Commands

```bash
pnpm --filter edubridge check-types
pnpm --filter edubridge lint
```

## Key paths

- `apps/edubridge/features/fees/components/publish-fee-plan-form.tsx`
- `apps/edubridge/app/[workspace]/(staff)/fees/structures/page.tsx`
- `apps/edubridge/features/shell/modules-for-session.ts`

## Next

Ask to generate + migrate coordinator SELECT on fee tables, then unlock Hub `fees.view` for coordinator.

Done in [0030](./0030-fee-select-coordinator.md).
