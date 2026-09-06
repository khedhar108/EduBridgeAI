# Fees

Student registration with guardian details, versioned fee structures, scholarships (0–100%), manual collections, and append-only audit.

## Routes served

- `/[workspace]/fees` — overview
- `/[workspace]/fees/structures` — visual heads + version timeline + publish
- `/[workspace]/fees/register` — register student + pin fee version + scholarship
- `/[workspace]/fees/collections` — record payments
- `/[workspace]/fees/audit` — who changed what

## Roles

- `school_admin` — Fees + Control Hub. Publishes structures (`fees.structure`).
- `accountant` — open Fees, collect (`fees.view` / `fees.collect`). Publish if Hub grants `fees.structure`.
- `coordinator` — open Fees when Hub grants `fees.view`. Collect/structure stay locked until write RLS.

## Key files

- `components/publish-fee-plan-form.tsx` — visual heads studio (demo starter → publish)
- `components/fee-heads-visual.tsx` / `fee-structure-timeline.tsx` — current structure + history
- `actions/publish-fee-plan.ts` — insert immutable plan version + audit (`fromDemo` on v1)
- `actions/register-student.ts` — student + guardian + fee pin + scholarship
- `actions/record-payment.ts` — manual payment + audit
- `queries/fees.ts` — list helpers including version history

## Depends on

- `features/shell` (module registry, `modulesForSession`)
- `packages/db` (`students`, `fee_*` tables)
