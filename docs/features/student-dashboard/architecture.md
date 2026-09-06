# Student dashboard — architecture

One feature folder, **two dashboards**. Do not mix sessions or chrome.

| | Family dashboard | School dashboard |
|--|------------------|------------------|
| Who | One parent or student | Teachers, staff, admin, accountant as allowed |
| Question | “How is **this child** doing?” | “How is **this class** doing?” then drill to a pupil |
| Filter | None — always `activeStudentId` from the cookie. Parent switcher still shows one child at a time. | **Class / section** (and later subject). Teacher: assigned classes. Admin: all classes. Staff: delegated classes. |
| URL | `/{slug}/family/*` | `/{slug}/students` (and `/{slug}/students/[studentId]`) |
| Chrome | `FamilyShell` (mobile, `familyModules`) | `ShellLayout` (desktop, `modules`) |
| Session | HMAC `edubridge.family` | Supabase + `getSessionContext` |
| Mode | Read-only | Writes (attendance, marks, activities) + class overview |
| Phase 1 | Hub + parent wrapper (Slice 2). Progress/exams/events read staff writes. | Class filter, attendance, class events, drill-in. Marks entry + admin CRUD still open. |

Cookie Path, App Router folders: [family-surface.md](../../architecture/auth/family-surface.md). Checkboxes: [implementation-plan.md](./implementation-plan.md).

Family never uses a class picker. School never uses the family cookie. Same `features/student-dashboard` `index.ts`; routes compose it.
