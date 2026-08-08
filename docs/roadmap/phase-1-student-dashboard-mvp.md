# Phase 1 — Student Dashboard (MVP)

> The first real module and the product's proof of value: teachers and staff record student activity, and parents/students see it as clear charts — all inside the unified shell built in Phase 0.

## Goal

Ship the Student Dashboard module: role-based data entry (attendance, activities, marks) by teachers/staff/admin, and read-only chart views for students and parents.

## Final outcome (definition of done)

At the pilot school: a teacher records attendance and marks for their class in under a minute per entry; a parent or student opens `/[workspace]/family` with **admission number + DOB** and sees that student’s dashboard (attendance trend, subject performance, recent activities). Parents with multiple children use one session + child switcher. Every staff write is attributed (who entered what, when).

## Scope

**In:**

- Academic structure: classes/sections, subjects, teacher-class assignments, student enrollment
- Data entry: attendance (daily, per class), activities (notes/observations), marks (per subject/assessment)
- Dashboard views: per-student page with charts (attendance %, marks by subject over time, activity feed)
- Role-scoped access: teacher sees own classes; admin sees all; staff sees delegated classes; student/parent see self / linked children via **family access** ([family-access.md](../architecture/auth/family-access.md))
- Parent–student linking: family **Add child** + admin `parent_links` CRUD
- `admission_number` unique per school; DOB on `students` for family proof
- Audit fields on every entry (`created_by`, `created_at`)

**Out (deferred):**

- AI summaries, WhatsApp sharing → Phase 2 (but see "share request" note below)
- Report card generation → Phase 3 (marks recorded here feed it)
- Bulk CSV import of students (nice-to-have; only if pilot school demands it)
- Timetables / homework digest → [Phase 5 — Timetable Maker](./phase-5-timetable-maker.md); fees still later

## Prerequisites

- Phase 0 exit criteria met (auth, tenancy, shell, feature folders)

## Deliverables

1. `apps/web/features/student-dashboard/` — the module, following the [feature-folder blueprint](../guides/feature-folder-structure.md), registered in `modules.ts`
2. Migrations: academic structure + entry tables (all tenant-scoped with RLS)
3. Charts using a shared chart setup added to `packages/ui` (pick one library, e.g. Recharts, and standardize)
4. `docs/features/student-dashboard/` — feature doc per [documenting-features guide](../guides/documenting-features.md)

## Milestones

### 1.1 Academic structure

- Tables: `classes` (name, section, academic_year), `subjects`, `class_subjects`, `teacher_assignments` (teacher ↔ class_subject), `students` (`admission_number` unique per school, DOB, class, roll no, optional profile link), `parent_links` (parent ↔ student).
- Admin UI: manage classes, subjects, assignments, enrollments, parent links (simple CRUD screens inside the module).
- Family entry: `/[workspace]/family` — admission + DOB; parent wrapper + child switcher ([family-access.md](../architecture/auth/family-access.md)).
- RLS: all tables filter by `school_id`; assignment tables drive teacher visibility; family session is read-only student-scoped.

### 1.2 Data entry

- Attendance: per-class daily grid (present/absent/late), editable same-day by the assigned teacher/staff, admin override later.
- Marks: assessments (`name`, `type`: periodic/term/other, `max_marks`, `date`) + per-student marks entry per class-subject.
- Activities: free-form observation entries (category + note) by teacher/staff/admin.
- Every entry records `created_by`; edits record `updated_by`.

### 1.3 Dashboard views

- Per-student dashboard page: attendance trend (monthly %), marks by subject across assessments, recent activities feed.
- Class overview for teachers/admin: class attendance summary, assessment averages.
- Student/parent landing: `/[workspace]/family` (admission + DOB); parent with multiple children gets a child switcher ([family-access.md](../architecture/auth/family-access.md)).
- Empty states everywhere (a new school has no data — the UI must still make sense).

### 1.4 Share-request stub (bridge to Phase 2)

- A "Share report" button on the student dashboard creates a `share_requests` row (`student_id`, `requested_by`, `channel: whatsapp`, `status: pending`).
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

- [ ] Teacher can only enter data for assigned classes (UI and RLS tested)
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
