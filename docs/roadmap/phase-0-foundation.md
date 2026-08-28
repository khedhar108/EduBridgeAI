# Phase 0 — Foundation

> Prerequisite for every other phase. Nothing user-facing ships here except a working sign-in and an empty shell — but everything after depends on getting this right.

## Progress tracker (agents: do not redo checked items)

**Last verified:** 2026-08-26 — RBAC dashboard branch: coordinator role, member activate/deactivate, admin login-as (impersonation), username sign-in, two-school seed (10 accounts + 65 students), platform console aggregates. Earlier: teacher/school_admin/platform-owner sign-in on localhost.

| Block                       | Status          | Notes                                                                 |
| --------------------------- | --------------- | --------------------------------------------------------------------- |
| **0.1** Schema + migration  | **Done**        | `0000`–`0006`; pilot + oakwood seed                                  |
| **0.2** RLS baseline        | **Done**        | Isolation SQL ready; two-school data seeded; live isolation smoke pending final exit |
| **0.3** Auth wiring         | **Done**        | All school roles login (incl. coordinator, accountant, staff); office-create / domain e2e still open |
| **0.4** Unified shell       | **Done**        | Adaptive header shell; marketing motion + Dotmatrix install deferred    |
| **0.5** Full seed + folders | **Done**        | 2 schools, 10 accounts, 65 students; parent/student auth accounts Phase 1 |

### Done vs next (checkboxes)

**Done**

- [x] Env: `DATABASE_URL` + `NEXT_PUBLIC_SUPABASE_*` in `apps/edubridge/.env.local`
- [x] Core tables + RLS (`0000`); pilot school seed (`edubridge-pilot-bridge`, domain `pilot-school.edu`)
- [x] Marketing home `/` + school `/sign-in` + platform `/platform/sign-in`
- [x] **Office create path:** staff directory Add member (`provisionMemberAction`) + password reset
- [x] **Domain join path:** `membership_requests` (`0002`) + `/join-school` + pending queue on team page
- [x] Docs: office create vs domain join + test logins — [auth-local-vs-prod.md](../guides/auth-local-vs-prod.md)
- [x] Family access architecture documented (option B) — [family-access.md](../architecture/auth/family-access.md)
- [x] Seeded Auth users for **every staff level** across **two schools** (password `TestLogin123!`, email or username sign-in):
  - [x] Pilot (`edubridge-pilot-bridge`): admin, coordinator, accountant, 3× teacher, staff
  - [x] Oakwood (`oakwood-academy-bridge`): admin, teacher
  - [x] Platform owner → `/platform/sign-in` as `owner@edubridge.app` / `platform-owner` → `/platform`
  - [x] 50 pilot + 15 oakwood students with guardians (admin dashboard + platform counts)
  - Full table: [auth-local-vs-prod.md](../guides/auth-local-vs-prod.md)

**Not testable yet (by design / later phase)**

- [ ] Family (parent/student admission + DOB) — Phase 1
- [ ] Brand-new school self-registration — Phase 6

**Next**

- [ ] Smoke-test office Add member + domain staff join → activate (paths exist; do later)
- [x] Shell chrome (0.4) — see sub-checklists below
- [x] Full role seed + RLS two-school test data (RBAC dashboard branch: coordinator + admin access controls — see [admin-controls.md](../architecture/auth/admin-controls.md))
- [ ] `pnpm lint` / `check-types` / `build` green at Phase 0 exit

### Two ways people join a school (plain English) — staff

| Path | Who | What happens |
|------|-----|----------------|
| **Add member** | Anyone the office picks (often Gmail / guest staff) | Coordinator or admin sets username, email, password, and a **fixed role**. Account is **active** immediately. |
| **Domain join** | Teacher/staff whose email is on the school’s official domain (e.g. `@pilot-school.edu`) | They sign up at `/join-school` → **pending** until admin **Activate** on Team page. |

**Parents and students** do **not** use Add member / domain for mass access. They use **admission number + DOB** on `/[workspace]/family` — [family-access.md](../architecture/auth/family-access.md) (implement Phase 1).

**Commands already run on dev (do not re-migrate `0000` unless schema changed):**

```bash
pnpm db:migrate    # 0000–0010 core/domain/fees/admin/archive/parent-links/academic; 0011 drops invitations
pnpm seed:dev      # 2 schools (pilot + oakwood), 10 accounts, 65 students
```

**Docs for DB workflow:** [`docs/guides/database-workflow.md`](../guides/database-workflow.md)

## Goal

Stand up the multi-tenant, role-aware skeleton of EduBridge: Supabase project with tenant-scoped schema and RLS, authentication with role-based access control, the unified application shell in `apps/edubridge`, and the feature-based folder structure all modules will follow.

## Final outcome (definition of done)

A user can sign in, land in their school workspace under the unified header (logo, application menu, active-module pill, search, profile), and see only the navigation their role permits. The database enforces tenant isolation at the row level even if application code has a bug. There is one seeded pilot school with users for every role.

## Scope

**In:**

- Supabase project setup (auth + Postgres), environment wiring for `apps/edubridge` and `apps/agent`
- Core schema: `schools`, `school_members`, `profiles`, role enum
- RLS policies + helper functions for "current user's school and role"
- Auth flows: sign in, sign out, office-created staff accounts (Add member + reset password)
- Unified shell layout: header, role-filtered application menu, module pill, search placeholder, profile menu
- Feature-folder scaffolding in `apps/edubridge/features/`
- Seed script for one pilot school with all six roles

**Out (deferred):**

- Public self-service school registration, trials, plan subscriptions → Phase 6
- Platform console UI, `platform_admins` wiring, support grants → Phase 6
  ([platform-boundaries.md](../architecture/platform-boundaries.md),
  [support-access.md](../architecture/support-access.md))
- Any module content (dashboard, report cards, tests) → Phases 1/3/4
- WhatsApp / AI → Phase 2
- Production subdomain DNS / wildcard TLS → Phase 6
  ([ADR-006](../decisions/ADR-006-workspace-subdomains.md); path-based `/[workspace]` is required now; keep host-rewrite-ready)

## Prerequisites

- [x] Monorepo builds green (`pnpm build`, `pnpm lint`, `pnpm check-types`) — verified during bootstrap
- [x] Supabase dev project created (`EduDatabase`); `DATABASE_URL` in `packages/db/.env` + `apps/edubridge/.env.local` (never committed)
- [x] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `apps/edubridge/.env.local` (required for Auth; see `.env.example`)
- [x] Bootstrap complete: `packages/db` + `apps/edubridge` exist (see [ADR-005](../decisions/ADR-005-primary-app-edubridge.md) and [build-log 0002](../build-log/0002-db-and-edubridge-app.md))

## Deliverables

1. [x] `docs/architecture/multi-tenancy.md` — schema + RLS reference
2. [x] **SaaS boundary docs** — [platform-boundaries.md](../architecture/platform-boundaries.md), [support-access.md](../architecture/support-access.md), [ADR-006](../decisions/ADR-006-workspace-subdomains.md) (architecture only; no Phase 6 code in Phase 0)
3. [x] **`packages/db`** — Drizzle schema, `0000_phase0_core.sql`, RLS in SQL, `withTenant()`, dev `/db-check` probe
4. [x] Auth SSR + tenant proxy basics in `apps/edubridge` (`proxy.ts`, `getSessionContext()`, school/platform sign-in, callback)
5. [x] Office create (`provisionMemberAction` + directory Add member) — invite tokens removed (`0011_drop-invitations`)
6. [ ] Shell layout components in `apps/edubridge/features/shell/` (registry exists; Header/AppMenu not built)
7. [x] Seed script (`pnpm seed:dev`) — **pilot school only**; full role seed in 0.5 after auth

## Milestones

### 0.1 Supabase project + `packages/db` schema

- [x] Supabase dev project created; Postgres + Auth enabled on dashboard
- [ ] Record email auth method choice as ADR (magic link vs password) — **pending near 0.3 exit**
- [x] `packages/db` Drizzle schema (single source of truth):
  - [x] `role` enum: `platform_owner | school_admin | teacher | staff | student | parent`
  - [x] `schools` (`id`, `name`, `slug` ending `-bridge`, `official_email_domain`, timestamps)
  - [x] `profiles` (`id` = auth user id, `full_name`, `phone`, `avatar_url`)
  - [x] `school_members` (composite PK `school_id` + `user_id`, `role`, timestamps)
- [x] First migration `0000_phase0_core.sql` generated; RLS/grants/helpers appended in same file
- [x] Helper SQL functions in `private` schema: `is_school_member`, `has_school_role`, `shares_school_with`
- [x] Migration applied to dev: `pnpm db:migrate`
- [x] Connection verified: `apps/edubridge/app/db-check/page.tsx` + Supabase Schema Visualizer

### 0.2 RLS baseline

- [x] RLS enabled + forced on `schools`, `profiles`, `school_members`
- [x] Policies use transaction-scoped claims (`request.jwt.claims`) per [data-access.md](../architecture/data-access.md)
- [x] Indexes on FKs / `school_id` (including `school_members_user_id_idx`, `school_members_school_id_role_idx`)
- [x] Rollback isolation test script: `packages/db/tests/rls-isolation.sql`
- [ ] Run isolation test against dev after two-school seed (blocked until 0.5 expands seed)

### 0.3 Auth + data-access wiring in `apps/edubridge`

- [x] Supabase SSR client setup (`@supabase/ssr`): session refresh in `proxy.ts`, server-component client ([docs/architecture/auth/](../architecture/auth/README.md))
- [x] `apps/edubridge/lib/auth/` + `lib/tenancy/` — `getSessionContext()` returns `{ userId, schoolId, role }`; `assertRole()` guards actions (folder map: [platform-boundaries.md](../architecture/platform-boundaries.md))
- [x] Routes: school `/sign-in`, platform `/platform/sign-in`, callback, choose-workspace, awaiting-invitation; marketing `/`
- [x] Tenant gate: `/[workspace]/...` resolves slug → school; non-members get 404
- [x] `withTenant()` used for office provision / domain activate (other product modules still later phases)
- [x] Office create: coordinator or admin sets credentials → `auth.admin.createUser` → `school_members` row created server-side
- [x] Domain join: matching `official_email_domain` → pending request → admin activates with role from team dashboard (never auto-active)
- [ ] Host rewrite later per ADR-006 — path-based now; keep rewrite-ready
- [x] Smoke-test: teacher + school_admin + platform owner sign-in on EduDatabase (2026-08-08)
- [ ] Smoke-test: office Add member + domain staff activate (paths ready — do later)

### 0.4 Unified shell

Architecture: [shell-layout.md](../design/shell-layout.md), [loaders.md](../design/loaders.md), [marketing-motion.md](../design/marketing-motion.md) (marketing deferred).

#### 0.4a Architecture docs

- [x] `shell-layout.md` written (adaptive hybrid shell + AI action contract)
- [x] `marketing-motion.md` written (Canvas UI + brand SVG plan)
- [x] `loaders.md` written (Dotmatrix policy)
- [x] `component-policy.md` + design README updated

#### 0.4b Agent skills

- [x] `edubridge-shell` skill
- [x] `dotmatrix` skill
- [x] `canvas-ui` skill
- [x] `docs/agents/README.md` skills table updated

#### 0.4c Shell components (`apps/edubridge/features/shell/`)

- [x] `Header` — logo, school context
- [x] `AppMenu` — role-filtered dropdown
- [x] `ModulePill` — route-aware active module
- [x] `SearchBar` — disabled placeholder
- [x] `ProfileMenu` — email, role badge, sign out
- [x] `ShellLayout` composes header + `{children}`
- [x] `AppLoader` — Dotmatrix-style grid loader + reduced-motion `Spinner` fallback

#### 0.4d Wiring

- [x] `app/[workspace]/layout.tsx` thin — imports from `features/shell`
- [x] `app/[workspace]/page.tsx` — role-relevant module cards
- [x] `features/shell/index.ts` public exports only

#### 0.4e Verify

- [x] Teacher / school_admin: menu items match role (Team admin-only)
- [x] Forbidden module URL blocked server-side (`/settings/team` → `notFound` for teacher)
- [x] `pnpm lint`, `pnpm check-types`, `pnpm --filter edubridge build` green
- [x] Build-log entry `0011-shell-chrome.md` + index update

#### Deferred (documented, not 0.4)

- Canvas UI homepage build
- Brand SVG asset pack
- 21st.dev MCP (local Cursor config only)
- Left module sidebar implementation
- AI dock (Phase 2)

Legacy single-line items (superseded by checklists above):

- [ ] `apps/edubridge/features/shell/`: `Header`, `AppMenu`, `ModulePill`, `SearchBar` (placeholder), `ProfileMenu`
- [ ] Layout `app/[workspace]/layout.tsx` renders the shell; module pages render inside
- [x] `modules.ts` registry shape defined (`{ id, title, href, icon, allowedRoles }`)
- [ ] Role filtering server-side; workspace home with role-relevant module cards
- [x] Public marketing home `/` separate from authenticated workspace routes

### 0.5 Feature-folder structure + seed

- [x] `apps/edubridge/features/shell/` + `features/_template/` scaffolded ([feature-folder blueprint](../guides/feature-folder-structure.md))
- [x] `features/auth/` + `features/marketing/` present for Phase 0.3 UI
- [x] Route files in `app/` stay thin (home, db-check, auth pages import from features)
- [x] Pilot seed: 1 school (`edubridge-pilot-bridge`) via `pnpm seed:dev`
- [x] Auth seed (dev): school_admin + teacher + platform owner (see [auth-local-vs-prod.md](../guides/auth-local-vs-prod.md))
- [ ] Full seed: + staff + students + parent (family path Phase 1; staff optional)
- [ ] Optional: 2–3 schools in seed for RLS isolation test

## Data model touchpoints

New tables: `schools`, `profiles`, `school_members` (+ `invitations`). Everything in later phases references `schools.id` and `school_members`.

## RBAC notes

- Role checks live in two layers: RLS (database, last line of defense) and server-side helpers in `apps/edubridge/lib/` (first line, friendly errors).
- The `platform_owner` role is global via `platform_admins` (Phase 6 console), **not** a `school_members` row. Reserve the enum now so it never migrates. Support entry is a separate audited grant — see [support-access.md](../architecture/support-access.md). Do not implement console or support grants in Phase 0.

## Standards established in this phase

- All DB access from server components / route handlers — no direct client-side table access beyond Supabase auth.
- Every new table ships in the same PR as its RLS policies and a policy test.
- Module registry (`modules.ts`) is the only place navigation is defined.

## Testing checklist

- [x] Sign in / sign out for the three seeded levels: teacher, school_admin, platform owner
- [ ] Sign in for remaining school roles (staff, student, parent) when seeded
- [ ] Add member end-to-end (office creates outsider, they sign in) — do later
- [ ] Domain join end-to-end (pending → admin activate) — do later
- [ ] Cross-tenant read attempts blocked by RLS (automated test with two schools)
- [ ] Menu shows correct items per role; direct URL access to a forbidden module returns 403/404
- [x] Dev DB connection probe (`/db-check` returns pilot school)
- [x] Auth slice typecheck green (`pnpm --filter edubridge check-types`)
- [ ] Full monorepo `pnpm build`, `pnpm lint`, `pnpm check-types` green at Phase 0 exit

## Exit criteria

- [ ] All testing checklist items pass
- [x] `docs/architecture/multi-tenancy.md` written and reviewed
- [x] Platform boundaries + support + subdomain ADR documented (Phase 6 implements)
- [ ] Phase 1 can start without touching auth, tenancy, or the shell
