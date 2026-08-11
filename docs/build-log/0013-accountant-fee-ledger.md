# 0013 — Accountant role + early fee ledger

**Date:** 2026-08-11

## Goal

Ship admin/accountant-checkable student registration with versioned fees, scholarships, manual collections, and audit.

## What changed

- Added `accountant` to `app_role` (migration 0003, own commit boundary for enum use).
- Tables: `students`, `student_guardians`, `fee_plans`, `fee_plan_versions`, `student_fee_assignments`, `fee_payments`, `fee_audit_events` + RLS (migration 0004).
- Feature module `apps/edubridge/features/fees` with routes under `/[workspace]/fees/*`.
- Invite/activate UIs include accountant; shell module registry shows Fees for admin + accountant.

## Commands

```bash
pnpm db:migrate
pnpm check-types
pnpm lint
```

## Key paths

- `packages/db/src/schema/fees.ts`
- `packages/db/src/schema/students.ts`
- `apps/edubridge/features/fees/`
- `docs/features/fees/README.md`

## Next

Run migrate on the shared DB; invite an accountant; publish a plan version and register a pilot student.
