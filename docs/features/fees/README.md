# Fees (early ledger)

**Status:** Ledger + visual structures in use. SIS create is moving to Students ([spec](../../wayfinder/student-registration.md)); `/fees/register` still creates a student until that cutover. Do not grow the Fees create form.

### Done

- [x] Versioned plans (`fee_plan_versions`); never rewrite a published version
- [x] Pin at registration (`student_fee_assignments`); old families keep their version after a new publish
- [x] Scholarship 0–100% on the assignment, not the plan (not retroactive)
- [x] Append-only payments + `fee_audit_events`
- [x] Visual structure studio (heads, live total, demo starter, change timeline)
- [x] Hub: `fees.structure` / `fees.collect` / `fees.view`; nav from `can()`
- [x] Coordinator `fees.view` via Hub (SELECT RLS + `is_demo`; default off until admin flips)
- [x] Accountant opens Fees; admin publishes; Hub may grant accountant `fees.structure`

### Left

- [ ] Coordinator `fees.collect` / `fees.structure` (needs write RLS split)
- [ ] `/fees/register` assigns a plan to an existing `student_id` (SIS cutover)

## Links

- Module code: [`apps/edubridge/features/fees/`](../../apps/edubridge/features/fees/)
- Routes: `/[workspace]/fees`, `/structures`, `/register`, `/collections`, `/audit`
- Schema: `packages/db/src/schema/students.ts`, `packages/db/src/schema/fees.ts`
- Migrations: `0003_accountant_role`, `0004_students_and_fees`, `0012_fee-demo-select`

## Roles

| Role | Access |
|------|--------|
| `school_admin` | Fees module + Control Hub. Publishes structures. |
| `accountant` | View Fees + record payments. Publish if Hub grants `fees.structure`. |
| `coordinator` | Open Fees when Hub `fees.view` is on. Collect/structure stay locked. |

## Design rules

1. **Versioned fees** — publishing creates `fee_plan_versions`; never rewrite amounts on an existing version.
2. **Pin after the student exists** — `student_fee_assignments.plan_version_id` freezes the deal. Today `/fees/register` still creates the student in the same submit; after SIS ships it must pick an existing `student_id` only.
3. **Scholarship 0–100%** — `concession_percent` on the assignment, not on the plan. Not retroactive.
4. **Audit** — every publish / register / payment writes `fee_audit_events`. First demo publish sets `detail.fromDemo`.

## Out of scope here

- Enquiry → application admissions pipeline
- Online payment gateway
- Expense / spending half of Max-plan Fees module
- Photo / ID files (private Storage; SIS spec, not this module)
- Dual registration + tuition plans until the Fees-only unique-index change (see spec)
