# Fees

Student registration with guardian details, versioned fee structures, scholarships (0–100%), manual collections, and append-only audit — for `school_admin` and `accountant`.

## Routes served

- `/[workspace]/fees` — overview
- `/[workspace]/fees/structures` — publish fee plan versions
- `/[workspace]/fees/register` — register student + pin fee version
- `/[workspace]/fees/collections` — record payments
- `/[workspace]/fees/audit` — who changed what

## Roles

- `school_admin` — full money access + team/settings elsewhere
- `accountant` — money flow only (this module); no Team settings

## Key files

- `actions/publish-fee-plan.ts` — insert immutable plan version + audit
- `actions/register-student.ts` — student + guardian + fee pin
- `actions/record-payment.ts` — manual payment + audit
- `queries/fees.ts` — list helpers

## Depends on

- `features/shell` (module registry)
- `packages/db` (`students`, `fee_*` tables)
