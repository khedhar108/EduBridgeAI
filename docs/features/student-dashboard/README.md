# Student dashboard

**Status:** Family dashboard Slice 1 hub + Slice 2 parent wrapper (`0009` migrated). School dashboard Slice 3: class filter, attendance grid, drill-in (`0010` migrated). Marks admin CRUD and family charts still open.

Two dashboards, one folder — [architecture.md](./architecture.md). **Checkboxes:** [implementation-plan.md](./implementation-plan.md).

Two dashboards, one folder — [architecture.md](./architecture.md). **Checkboxes:** [implementation-plan.md](./implementation-plan.md).

## Canonical map

Routes/cookie: [family-surface.md](../../architecture/auth/family-surface.md). Phase: [phase-1-student-dashboard-mvp.md](../../roadmap/phase-1-student-dashboard-mvp.md). Family cookie: [family-access.md](../../architecture/auth/family-access.md).

## Routes

| Surface | URL | Session | Filter |
|---------|-----|---------|--------|
| Family door | `/[workspace]/family` | none (form) | — |
| Family dashboard | `/[workspace]/family/home` (+ fees, progress, exams, events, add-child) | HMAC, **one child** | none (parent switcher still one child) |
| School dashboard | `/[workspace]/students` | Supabase `school_members` | **class / section** |
| School pupil drill-in | `/[workspace]/students/[studentId]` | same | after class pick |
