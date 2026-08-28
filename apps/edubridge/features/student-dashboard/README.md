# Student dashboard

Two dashboards, one module. Never mix sessions.

| Surface | URL | Filter |
|---------|-----|--------|
| Family (one child) | `/{slug}/family/*` | none — cookie `activeStudentId` |
| School (class-wise) | `/{slug}/students` | class / section |

## Routes served

- `/[workspace]/family/home` — child hub (Fees, Progress, Exams, Events)
- `/[workspace]/family/add-child` — parent only; another admission + DOB
- `/[workspace]/family/fees` — read-only ledger for the active child
- `/[workspace]/family/progress` — attendance % when staff have marked the register
- `/[workspace]/family/exams` — marks by assessment type (honest empty until recorded)
- `/[workspace]/family/events` — class-wide activities for the child’s class
- `/[workspace]/students` — class filter, attendance grid, class events
- `/[workspace]/students/[studentId]` — staff drill-in (same child the family hub reads)

## Roles

- Family cookie (`student` / `parent` viewer) — read-only; never staff Fees/Team/`/students`
- Staff (`school_admin`, `teacher`, `staff`) — class-wise writes on `/students` (`withTenant` + RLS)

## Key files

- `components/family-shell.tsx` — header, parent switcher, bottom `familyModules` nav
- `components/school-students-page.tsx` — class filter + register
- `components/attendance-grid.tsx` — daily present / absent / late
- `actions/record-attendance.ts` — upsert per pupil for the selected date
- `queries/get-family-academic.ts` — family reads (privileged `getDb()`)

## Depends on

- `features/shell` (`familyModules` family; `modules` staff Students)
- `lib/tenancy/family-session` (HMAC cookie)
- `lib/tenancy/session-context` (staff)
- `packages/db` (`parent_links`, fees, academic tables)
