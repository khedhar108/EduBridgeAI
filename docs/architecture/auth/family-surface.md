# Family surface — routes and folders (Phase 1)

> Family dashboard (one child, `/family/*`) ships as a hub. School dashboard (class filter, `/students`) has attendance + drill-in; marks admin CRUD still open. Checkbox tracker: [implementation-plan.md](../../features/student-dashboard/implementation-plan.md).

Canonical two-door table: [auth README](./README.md#two-doors-school-is-the-url). Cookie rules: [family-access.md](./family-access.md). Feature folders: [feature-folder-structure.md](../../guides/feature-folder-structure.md). Full module later: [phase-1-student-dashboard-mvp.md](../../roadmap/phase-1-student-dashboard-mvp.md).

## Hard constraint: cookie Path

`edubridge.family` is set with:

| Origin | Path |
|--------|------|
| Local | `/{slug}/family` |
| Production | `/family` on `{slug}.edubridge.app` (never `Domain=.edubridge.app`) |

Every family page **must** stay under that path or the browser will not send the cookie.

| Allowed | Forbidden |
|---------|-----------|
| `/{slug}/family` | `/{slug}/dashboard` |
| `/{slug}/family/home` | `/{slug}/students` (family) |
| `/{slug}/family/add-child` | Putting family pages inside `(staff)/` |

`proxy.ts` already treats `/{slug}/family` and nested segments as an auth surface (no Supabase user). Do not change that.

Staff pages stay under `(staff)/` and keep using `getSessionContext`. Family cookie must never satisfy that layout.

## Two dashboards, one feature folder

Family = **one student**. School = **class-wise**, then drill to a pupil. Full table: [architecture.md](../../features/student-dashboard/architecture.md).

```
 /{slug}/family/*                         /{slug}/students/*
 family HMAC                              Supabase + school_members
 FamilyShell (mobile)                     ShellLayout (desktop)
 READ ONLY · one child                    class filter + writes
```

Both trees import from `features/student-dashboard` via `index.ts`. Routes stay thin.

```
apps/edubridge/app/[workspace]/
├── (public)/
│   ├── sign-in/page.tsx              # staff door (done)
│   └── family/
│       ├── layout.tsx                # school from slug; unknown → notFound
│       ├── page.tsx                  # form if anonymous; redirect if cookie
│       └── (app)/                    # URL-neutral; cookie gate + FamilyShell
│           ├── layout.tsx
│           ├── home/page.tsx         # Slice 1 hub
│           ├── fees/page.tsx         # child dues (read-only)
│           ├── progress/page.tsx
│           ├── exams/page.tsx
│           ├── events/page.tsx
│           └── add-child/page.tsx    # parent only
└── (staff)/
    ├── layout.tsx                    # getSessionContext + ShellLayout (done)
    ├── page.tsx
    ├── fees/…                        # unchanged
    └── students/                     # school dashboard (class filter)
        ├── page.tsx
        └── [studentId]/page.tsx
```

Do **not** add a second `(family)` route group at the workspace level. Keep family URLs in `(public)/family/` so `proxy.ts` and the cookie Path stay aligned. Nested `(app)` is URL-neutral and gates every nested family page once.

### Layout branch

`family/layout.tsx` resolves the school (unknown slug → `notFound()`). Never call `getSessionContext` on family routes.

| Path | Cookie | Behaviour |
|------|--------|-----------|
| `/family` | none | Door form (`AuthShell` on the page) |
| `/family` | valid | `page.tsx` redirects to `/family/home` |
| `/family/*` nested | none | `(app)/layout.tsx` → `requireFamilySession` → `/family` |
| `/family/*` nested | valid | Wrap in `FamilyShell` (not `ShellLayout`) |

`family/page.tsx` is form-only. Sign-out is `familySignOutAction` from FamilyShell.

## Feature folders

### Stay in `features/auth/` (identity only)

| File | Role |
|------|------|
| `components/family-sign-in-form.tsx` | Admission + DOB (done) |
| `actions/family-sign-in.ts` | Set/clear cookie (done) |
| `actions/add-child.ts` | Append `studentIds` + `parent_links` |
| `actions/switch-child.ts` | `activeStudentId` (must be in cookie `studentIds`) |
| `queries/get-family-student.ts` | Preview row (done; home can keep using it) |
| `lib/schemas.ts` | `familySignInSchema` + add-child schema |

Auth must not grow charts, attendance grids, or academic CRUD.

### New `features/student-dashboard/` (domain)

Copy `features/_template/`. Public door is `index.ts` only.

```
apps/edubridge/features/student-dashboard/
├── components/
│   ├── family-shell.tsx              # shipped: header + bottom nav
│   ├── family-home.tsx               # shipped: hub cards
│   ├── family-nav.tsx
│   ├── family-destination-grid.tsx
│   ├── family-fees.tsx               # shipped: read-only ledger or empty
│   ├── family-progress.tsx           # shipped: honest empty
│   ├── family-exams.tsx
│   ├── family-events.tsx
│   ├── family-awaiting.tsx
│   ├── family-page-intro.tsx
│   ├── child-switcher.tsx            # parent, 2+ children
│   ├── attendance-grid.tsx           # staff, Slice 3
│   └── student-charts.tsx            # Slice 3
├── queries/
│   ├── get-family-fee.ts             # shipped
│   └── get-student-summary.ts        # Slice 3; family + staff pass studentId
├── actions/
│   └── record-attendance.ts          # staff only; assertRole + withTenant
├── lib/
│   ├── family-destinations.ts
│   └── format-inr.ts
├── types.ts
├── index.ts
└── README.md
```

Family queries take `schoolId` + `studentId` from the **verified cookie payload**, then re-check `student.school_id === session.schoolId` and `student.id` ∈ `session.studentIds`. Never take `studentId` from the URL alone.

Staff queries use `getSessionContext` + `withTenant`. Same `queries/` file may accept a tx; two thin wrappers if that stays clearer.

### `features/shell/modules.ts`

Staff nav stays `modules` (Fees, Team, later Students). Family users never hit `ShellLayout`, so they must not rely on `modulesForRole("parent")`.

Add a **second** list in the same file:

```ts
export const familyModules: ModuleNavItem[] = [
  { id: "family-home", title: "Home", href: "/family/home", icon: "home", allowedRoles: ["student", "parent"] },
  { id: "family-fees", title: "Fees", href: "/family/fees", icon: "wallet", allowedRoles: ["student", "parent"] },
  { id: "family-progress", title: "Progress", href: "/family/progress", icon: "chart", allowedRoles: ["student", "parent"] },
  { id: "family-exams", title: "Exams", href: "/family/exams", icon: "book", allowedRoles: ["student", "parent"] },
  { id: "family-events", title: "Events", href: "/family/events", icon: "calendar", allowedRoles: ["student", "parent"] },
];
```

`FamilyShell` reads `familyModules`. Do not hard-code nav in random components. `allowedRoles` here is documentary; the family layout already proved the cookie. Do not add `student` / `parent` to Fees or Team.

## Session helpers (already exist)

| Helper | File | Use |
|--------|------|-----|
| `getFamilySession(slug)` | `lib/tenancy/family-session.ts` | Family door |
| `requireFamilySession(slug)` | same | Nested family layouts/pages |
| `getSessionContext(slug)` | `lib/tenancy/session-context.ts` | Staff layout only |
| `matchStudentForFamily` | `lib/tenancy/match-student-for-family.ts` | Auth actions only |

Do not merge these. Do not teach `getSessionContext` to read `edubridge.family`.

## URL map (local)

Pilot slug: `edubridge-pilot-bridge`. Seed child: `EBS-2024-006` / `2013-06-06` (Reyansh Menon). Add child: `EBS-2024-007` / `2012-07-07` (Arjun Gupta).

| URL | Who | Session |
|-----|-----|---------|
| `/edubridge-pilot-bridge/sign-in` | Staff | Supabase |
| `/edubridge-pilot-bridge/family` | Family door | None (form) |
| `/edubridge-pilot-bridge/family/home` | Family app | HMAC |
| `/edubridge-pilot-bridge/family/fees` | Family (read-only dues) | HMAC |
| `/edubridge-pilot-bridge/family/progress` | Family | HMAC |
| `/edubridge-pilot-bridge/family/exams` | Family | HMAC |
| `/edubridge-pilot-bridge/family/events` | Family | HMAC |
| `/edubridge-pilot-bridge/family/add-child` | Parent | HMAC |
| `/edubridge-pilot-bridge/fees` | Staff | Supabase; family cookie = bounce to staff sign-in |
| `/edubridge-pilot-bridge/students` | Staff (later) | Supabase |

Production (ADR-006, not built yet): host is the school, paths drop the slug (`/family/home`). Cookie Path `/family` still covers them.

PWA (later, not Slice 1): on the school origin, `start_url: "/family"`, `scope: "/family"`. That only works if we never put family UI outside `/family`.

## What each slice ships

Full checklist (same boxes): [implementation-plan.md](../../features/student-dashboard/implementation-plan.md).

### Slice 1 — family chrome + hub

- [x] Module + `FamilyShell` + signed-in `/family` → `/family/home`
- [x] Nested `/family/*` without cookie → `/family`
- [x] `familyModules` + bottom nav: Home, Fees, Progress, Exams, Events
- [x] Home hub cards; Fees read-only (or honest empty); Progress / Exams / Events empty until tables exist
- [x] Sign out via `familySignOutAction`; cookie still not staff Team/Fees
- [x] No new migration; no invented scores; no family pay form

### Slice 2 — parent wrapper

- [x] `parent_links` + RLS (`family_id` sibling group; schema generate; apply migrate when permitted)
- [x] Add child (admission + DOB → append `studentIds`)
- [x] Child switcher (`activeStudentId`)
- [x] `/{slug}/family/add-child`
- [ ] Admin `parent_links` CRUD (still open on staff `/students`)

### Slice 3 — school dashboard (Phase 1)

- [x] Academic tables + RLS (`0010_academic-structure`)
- [x] `/{slug}/students` with **class / section filter** (teacher assigned; admin all; staff delegated)
- [x] Class overview + attendance grid + class-wide activities
- [ ] Per-class marks entry
- [x] Drill-in `/{slug}/students/[studentId]`

### Slice 3 — family fills from school writes

- [x] Real Progress / Exams / Events on the **one** active child (honest empty until staff record)
- [ ] Charts on family home
- [ ] Student-scoped family RLS / `set_config` if we stop privileged `getDb()` for family reads
- [ ] PWA manifest `scope` `/family`

## Do not

- Create mass `auth.users` for students or parents.
- Import `student-dashboard` from `auth` or the reverse (routes compose both).
- Reuse `ShellLayout` for family (staff nav would leak Team/Fees hrefs).
- Put a class filter on family routes, or FamilyShell on `/students`.
- Widen cookie Path to `/`.
- Store the family session in `localStorage`.
- Hand-write `migrations/*.sql` for `parent_links` — schema TS then `pnpm db:generate`.

## Import rules

```
app/[workspace]/(public)/family/home/page.tsx
  → @/features/student-dashboard   (FamilyHome)
  → @/lib/tenancy/family-session   (session)

app/[workspace]/(public)/family/page.tsx
  → @/features/auth                (form, AuthShell)

app/[workspace]/(staff)/students/page.tsx
  → @/features/student-dashboard
  → @/lib/tenancy/session-context
```
