# Student dashboard — implementation plan

Two dashboards, one module: [architecture.md](./architecture.md). Routes: [family-surface.md](../../architecture/auth/family-surface.md). Phase outcome: [phase-1-student-dashboard-mvp.md](../../roadmap/phase-1-student-dashboard-mvp.md).

## Slice 1 — family dashboard chrome + hub (shipped)

Single-student surface. No class filter.

Door and session:

- [x] `/{slug}/sign-in` How are you? chooser → staff `SignInForm` or family `FamilySignInForm` (`?who=school|family`)
- [x] Anonymous `/{slug}/family` → `/sign-in?who=family`; cookie → `/family/home`
- [x] Admission match ignores hyphens/spaces (`EBS2024006` = `EBS-2024-006`)
- [x] HMAC cookie `edubridge.family` (Path `/family`; not staff)
- [x] Cookie cannot open Team, staff `/fees`, or school `/students`

Chrome:

- [x] `apps/edubridge/features/student-dashboard/` scaffold + module README
- [x] `FamilyShell` (school, child chip, sign out) — not `ShellLayout`
- [x] Nested `(app)` layout: cookie required; missing cookie → `/family`
- [x] Signed-in `/family` → `/family/home` for **that** child only

Hub (cookie Path `/family/*`):

- [x] `familyModules`: Home, Fees, Progress, Exams, Events
- [x] Bottom nav from `familyModules` only
- [x] Home destination cards (Fees, Progress, Exams, Events)
- [x] `/family/fees` read-only ledger from `student_fee_assignments` / `fee_payments` (honest empty if no plan)
- [x] `/family/progress` / `/family/exams` / `/family/events` hub pages (filled from tables in Slice 3)
- [x] No invented scores, no family pay/submit form, no new migration

## Slice 2 — family: parent wrapper (shipped)

Still one child on screen at a time — not a class roster. `parent_links.family_id` is an opaque sibling group, not a parent `auth.users` row.

- [x] `parent_links` table + RLS (schema TS → `pnpm db:generate`; `0009_parent-links` migrated)
- [x] Add child: another admission + DOB → append cookie `studentIds`
- [x] Child switcher (`activeStudentId`)
- [x] `/{slug}/family/add-child`

## Slice 3 — school dashboard (in progress)

Staff workspace. **Class-wise filtration** is the point of this surface.

- [x] Academic tables (`classes`, `subjects`, `class_subjects`, `teacher_assignments`, enrollment, `attendance_records`, `assessments`, `marks`, `activities`, `share_requests`) + RLS (`0010_academic-structure`)
- [x] `modules` entry: Students → `/{slug}/students` (`school_admin`, `teacher`, `staff`; never family cookie)
- [x] Class / section filter (teacher = assigned classes; admin = all; staff = delegated)
- [x] Class overview: attendance counts for the selected date
- [x] Per-class attendance grid + class-wide activities (`created_by` / `updated_by`)
- [ ] Per-class marks entry
- [x] Drill-in `/{slug}/students/[studentId]` (staff session; same child the family hub reads)
- [ ] Admin structure CRUD: classes, subjects, assignments, enrollments, `parent_links`

## Slice 3 — family dashboard fills from school writes

Family pages stay single-student. They read what staff entered on the school dashboard.

- [x] Real `/family/progress` / `/family/exams` / `/family/events` from those tables (honest empty until staff record)
- [ ] Charts on family home (Recharts via `packages/ui` primitives)
- [ ] Student-scoped family RLS / `set_config` if we stop privileged `getDb()` for family reads
- [ ] PWA manifest `scope` `/family`
- [ ] `share_requests` stub UI (table exists; Phase 2 WhatsApp bridge)

## Not this module (do not check off here)

- Family online fee payment / “submit fees” — later; staff Fees stays write
- Mass `auth.users` for students or parents
- Charts or fake marks before the school dashboard can record them
- Putting a class filter on `/family/*`
- Putting family chrome on `/students`
- Student left / rejoin years later (same admission = same row; new admission = new student; no alumni link)
- Phone + DOB as the family door (optional OTP later)
