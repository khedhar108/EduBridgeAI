# Fees (early ledger)

**Status:** In progress

Direct student registration + versioned fee structures for Indian schools. Admin and accountant manage money flow; existing student fee pins stay immutable when structures change.

## Links

- Module code: [`apps/edubridge/features/fees/`](../../apps/edubridge/features/fees/)
- Routes: `/[workspace]/fees`, `/structures`, `/register`, `/collections`, `/audit`
- Schema: `packages/db/src/schema/students.ts`, `packages/db/src/schema/fees.ts`
- Migrations: `0003_accountant_role`, `0004_students_and_fees`

## Roles

| Role | Access |
|------|--------|
| `school_admin` | Fees module + Team/settings |
| `accountant` | Fees module only (money flow) |

## Design rules

1. **Versioned fees** — publishing creates `fee_plan_versions`; never rewrite amounts on an existing version.
2. **Pin at registration** — `student_fee_assignments.plan_version_id` freezes the deal for that student.
3. **Scholarship 0–100%** — `concession_percent` on the assignment.
4. **Audit** — every publish / register / payment writes `fee_audit_events`.

## Out of scope here

- Enquiry → application admissions pipeline
- Online payment gateway
- Expense / spending half of Max-plan Fees module
- Photo upload to Storage (column exists; UI later)
