# Control Hub (permissions)

Label: `wayfinder:map`  
Tracker: local markdown.

## Destination

School admin opens **Control Hub** (`/{slug}/settings/control`): modules as groups, each permission a Switch per role. Role copy states the default job. Admin may add **extra** capabilities on one member (`user_id`, not email). Teachers stay scoped by `teacher_assignments` (more rows = multi-subject). Login as stays. Last 90 days of staff sign-ins when that table ships.

## Status

### Done

- [x] Slice 1 — Control Hub page + `assertCapability` on Fees/Team
- [x] Slice 2 — `schools.capability_overrides`; Hub Switches persist
- [x] Slice 4 — nav from `can()` (`modulesForSession`); Fees tabs hide Register/Collections without `fees.collect`
- [x] Visual fee structures — labeled heads, live total, demo starter, version timeline
- [x] Scholarship at registration (assignment-level, not retroactive); payable preview
- [x] Version pin — new publishes never rewrite `student_fee_assignments` / old payments
- [x] Slice 3a — coordinator fee SELECT; Hub `fees.view`; `fee_plans.is_demo`

### Left (do not start here)

- [ ] Slice 3b — write RLS split so Hub `fees.collect` / `fees.structure` can be honest for coordinator (`fee_plans_write` vs `fee_payments_insert`)
- [ ] Slice 5 — per-member extras (`member_capability_grants`) + 90-day `staff_sign_in_events`
- [ ] SIS cutover — `/fees/register` stops creating students ([student-registration.md](./student-registration.md))

Admin column stays on. Other Hub cells are live; grants outside a role default confirm first. Coordinator fee writes still need slice 3b RLS to succeed at the database.

## Notes

- Skills: `ponytail`, `70-permissions.mdc`. Ask before `db:generate` / `db:migrate`.
- Flags are capability keys, not per-module booleans. Coordinator with `fees.collect` is not an accountant.
- Who-changed for money: `fee_audit_events` + `recorded_by` / `created_by`. Hub flips later use `admin_audit_events`.
- Payments stay append-only.

## Implementation roadmap (what to modify)

Do in this order. Do not skip to persist before actions use `assertCapability`.

| Slice | Modify | Do not touch |
| --- | --- | --- |
| **1 — done** | `lib/auth/capabilities.ts`; Fees actions/pages; `features/shell/modules.ts` + icon maps; `settings/control` page; this map | Schema, RLS, SIS form, impersonation |
| **2 — done** | `schools.capability_overrides` jsonb; `can()` merge; Hub save + `admin_audit_events`; all non-admin Hub Switches persist (confirm when outside role default) | Per-member table; marks RLS |
| **3a — done** | Coordinator fee **SELECT** + `fee_plans.is_demo`; Hub `fees.view` for coordinator | Write policies, unique fee-assignment index |
| **3b** | Split `fee_plans_write` vs `fee_payments_insert` so coordinator `fees.collect` writes succeed | Unique fee-assignment index |
| **4 — done** | `modulesForSession` uses `can()` so Fees appears when `fees.view` is on | Family cookie |
| **5** | `member_capability_grants`; 90-day `staff_sign_in_events` | Custom roles |

## Decisions so far

- [Where identity files live](./tickets/research-where-identity-files-live.md) — Storage (SIS map; not Hub).
- Grant shape: role defaults + member extras, not a per-email matrix.
- Login as stays; add 90-day history later ([90-day login store](./tickets/research-staff-login-history.md)).
- Flags: Hub Switch = capability. Fees split: `fees.structure` admin-only default; `fees.collect` admin+accountant, may add coordinator; who-changed already on `fee_audit_events`. Extra grants confirm first. RLS still backstops writes slice 3b has not opened.
- Identity key: `school_members.user_id`.

## Not yet specified

- Login history: admin-only vs coordinator; IP vs who/when/role ([grill](./tickets/grill-login-history-fields.md)).
- Which extras an admin may pin on a member ([grill](./tickets/grill-member-extra-allowlist.md)).
- When to tighten marks RLS to class-subject ([grill](./tickets/grill-marks-class-subject-rls.md)).
- Usage dashboard vs raw 90-day table.
- Whether extras show on the directory row.

## Out of scope

- Custom roles, Casbin, per-email matrix
- Removing Login as
- Family-door login history
- Building persist/RLS in slice 1
- SIS field inventory (other map)
