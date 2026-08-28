# Phase 1 — Student Dashboard (MVP)

> Two dashboards, one module: **family** (one child, read-only) and **school** (class-wise filter, staff writes). Same `features/student-dashboard` folder; never mix sessions.

## Goal

Ship both surfaces. Staff record attendance, activities, and marks **by class**. Parents and students open `/[workspace]/family` and see **that child** only.

## Final outcome (definition of done)

At the pilot school: a teacher opens `/[workspace]/students`, picks **their class**, and records attendance/marks in under a minute per entry. A parent or student opens `/[workspace]/family` with admission number + DOB and sees **that student’s** dashboard (attendance trend, subject performance, recent activities). Parents with multiple children use one session + child switcher (still one child on screen). Every staff write is attributed (who entered what, when).

## Scope

**In:**

- Academic structure: classes/sections, subjects, teacher-class assignments, student enrollment
- Data entry: attendance (daily, per class), activities (notes/observations), marks (per subject/assessment)
- Dashboard views: **family** = one child; **school** = class filter then pupil drill-in ([architecture.md](../features/student-dashboard/architecture.md))
- Role-scoped access: teacher sees own classes; admin sees all; staff sees delegated classes; student/parent see self / linked children via **family access** ([family-access.md](../architecture/auth/family-access.md))
- Parent–student linking: family **Add child** + admin `parent_links` CRUD
- `admission_number` unique per school; DOB on `students` for family proof
- Audit fields on every entry (`created_by`, `created_at`)

**Out (deferred):**

- AI summaries, WhatsApp sharing → Phase 2 (but see "share request" note below)
- Report card generation → Phase 3 (marks recorded here feed it)
- Bulk CSV import of students (nice-to-have; only if pilot school demands it)
- Timetables / homework digest → [Phase 5 — Timetable Maker](./phase-5-timetable-maker.md)
- Full Fees & Spending analytics / online payments → later; early versioned fee ledger + direct registration lives in [`features/fees`](../../apps/edubridge/features/fees/) (admin + accountant)

## Prerequisites

- Phase 0 exit criteria met (auth, tenancy, shell, feature folders)
- Family door + hub: see [implementation-plan.md](../features/student-dashboard/implementation-plan.md) Slice 1 (checked). Slice 2 parent wrapper migrated (`0009`). Slice 3 school `/students` attendance + family fills in progress.

## Two dashboards in this phase

| Dashboard | URL | Filter | Status |
|-----------|-----|--------|--------|
| Family (one child) | `/{slug}/family/*` | none (`activeStudentId`) | Slice 1 hub + Slice 2 parent wrapper (`0009`) |
| School (class-wise) | `/{slug}/students` | class / section | Slice 3 attendance + drill-in (`0010`); marks CRUD open |

Checkboxes: [implementation-plan.md](../features/student-dashboard/implementation-plan.md).

## Deliverables

1. `apps/edubridge/features/student-dashboard/` — the module, following the [feature-folder blueprint](../guides/feature-folder-structure.md). Staff nav in `modules.ts`; family nav in `familyModules`. Routes: [family-surface.md](../architecture/auth/family-surface.md).
2. Migrations: academic structure + entry tables (all tenant-scoped with RLS)
3. Charts using a shared chart setup added to `packages/ui` (pick one library, e.g. Recharts, and standardize)
4. `docs/features/student-dashboard/` — feature doc per [documenting-features guide](../guides/documenting-features.md)

## Milestones

### 1.1 Academic structure

- Tables: `classes` (name, section, academic_year), `subjects`, `class_subjects`, `teacher_assignments` (teacher ↔ class_subject), `students` (`admission_number` unique per school, DOB, class, roll no, optional profile link), `parent_links` (`family_id` sibling group, not a parent auth user).
- Admin UI: manage classes, subjects, assignments, enrollments, parent links (simple CRUD screens inside the module).
- Family entry: `/[workspace]/family` door + hub + parent wrapper **shipped in code**; apply `0009_parent-links` when permitted. Admin `parent_links` CRUD waits for `/students` ([family-access.md](../architecture/auth/family-access.md), [implementation-plan.md](../features/student-dashboard/implementation-plan.md)).
- RLS: all tables filter by `school_id`; assignment tables drive teacher visibility; family session is read-only student-scoped.

### 1.2 Data entry

- Attendance: per-class daily grid (present/absent/late), editable same-day by the assigned teacher/staff, admin override later.
- Marks: assessments (`name`, `type`: periodic/term/other, `max_marks`, `date`) + per-student marks entry per class-subject.
- Activities: free-form observation entries (category + note) by teacher/staff/admin.
- Every entry records `created_by`; edits record `updated_by`.

### 1.3 Dashboard views

- **School dashboard** (`/{slug}/students`): class / section filter; class attendance summary; assessment averages; drill-in per student.
- **Family dashboard** (`/{slug}/family/home`): that child only — attendance trend, marks by subject, activities. Hub chrome is Slice 1; charts wait on school writes.
- Empty states everywhere (a new school has no data — the UI must still make sense).

### 1.4 Share-request stub (bridge to Phase 2)

- A "Share report" button on the **family** dashboard creates a `share_requests` row (`student_id`, `requested_by`, `channel: whatsapp`, `status: pending`).
- In this phase it only shows "sharing coming soon" — but the table and button exist so Phase 2 plugs in without UI rework.

## Data model touchpoints

New tables: `classes`, `subjects`, `class_subjects`, `teacher_assignments`, `students`, `parent_links`, `attendance_records`, `assessments`, `marks`, `activities`, `share_requests`. All carry `school_id` + RLS. `assessments`/`marks` are designed so Phase 3 (report cards) reads them without migration.

## RBAC notes

| Action | school_admin | teacher | staff | student | parent |
|---|---|---|---|---|---|
| Manage structure (classes, links) | ✅ | — | — | — | — |
| Enter attendance/activities | ✅ | ✅ own classes | ✅ delegated | — | — |
| Enter marks | ✅ | ✅ own class-subjects | — | — | — |
| View dashboards | all students | own classes | delegated | self | linked children |
| Request share | ✅ | ✅ | — | — | ✅ |

## Standards

- All chart components live in the feature folder; only the base chart primitives go to `packages/ui`.
- Server actions / route handlers validate role + assignment before any write (RLS is the backstop, not the UX).
- Dates stored as dates (not timestamps) for attendance/assessments; timezone handling is school-local.

## Testing checklist

- [ ] School dashboard filters by class; teacher sees only assigned classes (UI and RLS)
- [ ] Family dashboard is one child (`activeStudentId`); no class picker
- [ ] Parent sees exactly their linked children, student sees only self
- [ ] Charts render correctly with 0, 1, and many data points
- [ ] Attendance percentage and subject averages computed correctly (unit tests)
- [ ] Audit fields populated on all writes
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- Pilot school uses the dashboard for two real weeks (attendance + at least one assessment recorded)
- All testing checklist items pass
- `docs/features/student-dashboard/` written
- `share_requests` table ready for Phase 2
