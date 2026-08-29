# Feature-Folder Blueprint

> The canonical template for every module in `apps/edubridge/features/`. Copy this structure exactly when creating a module. Registered here once — referenced by every phase and by the AI rules.

## Why feature folders

Code is organized by **product module**, not by technical layer. Everything a module needs lives in one folder; deleting a module deletes its folder. This is what makes the monorepo scale as modules are added phase by phase without touching each other.

## The template

```
apps/edubridge/features/<module>/
├── components/       # Module-scoped React components (never imported by other modules)
├── hooks/            # Module-scoped React hooks
├── queries/          # Server-only data access: Drizzle queries / fetchers
├── actions/          # Server actions (mutations) — role-validated, tenant-scoped
├── lib/              # Pure helpers, zod validators, module constants
├── types.ts          # Module types (no imports from other features)
├── index.ts          # Public surface — the ONLY file other code may import from
└── README.md         # 15–30 lines: purpose, routes served, roles, key files
```

Example for the student dashboard module:

```
apps/edubridge/features/student-dashboard/
├── components/
│   ├── attendance-grid.tsx
│   ├── marks-entry-form.tsx
│   └── student-charts.tsx
├── hooks/
│   └── use-student-summary.ts
├── queries/
│   ├── attendance.ts        # getAttendance(tx, studentId, range)
│   └── marks.ts             # getMarksBySubject(tx, studentId)
├── actions/
│   ├── record-attendance.ts # "use server", role-guarded
│   └── record-marks.ts
├── lib/
│   ├── attendance-stats.ts  # pure: percentage calc, unit-tested
│   └── schemas.ts           # zod input validators
├── types.ts
├── index.ts                 # export { StudentCharts } from "./components/student-charts"; ...
└── README.md
```

## Rules (enforced by `.cursor/rules/20-structure.mdc`)

1. **Routes stay thin.** Files in `apps/edubridge/app/` only compose feature exports — no data logic, no SQL, no business rules in route files.
2. **One public door.** Other code imports only from the module's `index.ts`. Deep imports into another module's internals are forbidden.
3. **Modules never import modules.** Shared needs go up, not sideways: shared UI → `packages/ui`, shared DB schema → `packages/db`, shared helpers → `apps/edubridge/lib/`.
4. **Promote to shared only at 2+ consumers.** A component/helper used by a single module stays in that module.
5. **queries/ and actions/ are server-only.** Never import them from client components; client components call actions or read props from server components.
6. **Every mutation action** resolves the session context, asserts the role, and runs inside the tenant transaction (`withTenant`) — see [data-access.md](../architecture/data-access.md).
7. **Registration.** Every module adds one entry to the shell module registry (`features/shell/modules.ts`) with `{ id, title, href, icon, allowedRoles }`. That entry is the only place navigation is defined.

## The module README (15–30 lines)

Every module ships with a README following this shape — it is the per-module context bundle AI agents read first:

```markdown
# <Module name>

<One line: what it does and who uses it.>

## Routes served
- /[workspace]/students/...

## Roles
<who can see/use it, one line per role>

## Key files
- components/student-charts.tsx — dashboard charts
- actions/record-attendance.ts — attendance mutation

## Depends on
- features/shell (layout, module registry)
- packages/db (schema: attendance_records, marks)
```

## Product surface map (bounded contexts)

Do not invent a second app. Thin routes and feature folders stay under `apps/edubridge` as specified in [platform-boundaries.md](../architecture/platform-boundaries.md):

| Feature folder | Responsibility |
|----------------|----------------|
| `legal/` | Public Terms, Privacy, Cookies, site footer, cookie banner |
| `auth/` | Identity UI/actions only (staff sign-in, family cookie set/clear) |
| `student-dashboard/` | **Family** dashboard (`/family/*`, one child) + **school** dashboard (`/students`, class filter) — [architecture.md](../features/student-dashboard/architecture.md) |
| `memberships/` | School member + role management |
| `shell/` | Workspace chrome + module registry (`modules` staff, `familyModules` family) |
| `registration/` | School signup + provisioning (Phase 6) |
| `billing/` | School-facing subscription/invoices (Phase 6) |
| `platform-console/` | Owner aggregates only (Phase 6) |
| `support-access/` | JIT support grants (Phase 6) |
| `<product-module>/` | Domain features (dashboard, report cards, …) |

Shared seams: `lib/auth`, `lib/tenancy`, `lib/access` — promote only at 2+ consumers.

## Adding a new module (checklist)

1. Copy the template into `apps/edubridge/features/<module>/`.
2. Write the module README first (it is the spec in miniature).
3. Add the registry entry with correct `allowedRoles`.
4. Create thin routes under `app/[workspace]/` that compose the module's exports.
5. Schema changes go to `packages/db` with migrations + RLS policies in the same change.
6. Create `docs/features/<module>/` per [documenting-features.md](./documenting-features.md).
