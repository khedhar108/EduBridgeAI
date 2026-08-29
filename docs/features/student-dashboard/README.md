# Student dashboard

**Status:** Family door + hub + parent wrapper (siblings via Add child). School `/students` attendance + drill-in. Open: SIS create on `/students/new` (spec first), marks entry, admin structure CRUD, charts, PWA, `share_requests` button, alumni/rejoin.

Two dashboards, one folder — [architecture.md](./architecture.md). **Checkboxes:** [implementation-plan.md](./implementation-plan.md). SIS create spec: [student-registration.md](../../wayfinder/student-registration.md).

## Canonical map

Routes/cookie: [family-surface.md](../../architecture/auth/family-surface.md). Phase: [phase-1-student-dashboard-mvp.md](../../roadmap/phase-1-student-dashboard-mvp.md). Family cookie: [family-access.md](../../architecture/auth/family-access.md). SIS register: [student-registration.md](../../wayfinder/student-registration.md).

## Routes

| Surface | URL | Session | Filter |
|---------|-----|---------|--------|
| Public door | `/[workspace]/sign-in` | none (How are you?) | — |
| Family proof | `/[workspace]/sign-in?who=family` | none (form) | — |
| Family dashboard | `/[workspace]/family/home` (+ fees, progress, exams, events, add-child) | HMAC, **one child** | none (parent switcher still one child) |
| School dashboard | `/[workspace]/students` | Supabase `school_members` | **class / section** |
| School SIS create | `/[workspace]/students/new` | same + `students.register` | spec only — not shipped |
| School pupil drill-in | `/[workspace]/students/[studentId]` | same | after class pick |
