# Admin Access Controls — Coordinator, Activation, Impersonation

> How school admins delegate people-management to coordinators, deactivate
> members instantly, archive memberships (no hard delete), change roles, view-as
> another user, and how username sign-in works.
> The capability map in `apps/edubridge/lib/auth/capabilities.ts` is the
> single source of truth for privileged actions; RLS remains the backstop.
> Admin module-grouped Switches are **Control Hub**
> ([control-hub.md](../../wayfinder/control-hub.md)). The directory Switch is
> member active/inactive, not a capability grant. Hub may grant extras beyond
> role defaults after confirm; RLS still backstops writes the role cannot
> perform.

Related: [rbac-model.md](./rbac-model.md) · [auth README](./README.md) ·
[multi-tenancy.md](../multi-tenancy.md) · [Control Hub](../../wayfinder/control-hub.md)

## Capability map (who can do what)

| Capability               | school_admin | coordinator |
| ------------------------ | :----------: | :---------: |
| `members.viewDirectory`  |      ✓       |      ✓      |
| `members.provision`      | ✓ (not school_admin) | ✓ (non-admin roles only) |
| `members.resetPassword`  | ✓ (not school_admin / self / archived) | ✓ (non-admin roles only) |
| `members.activate`       | ✓ (not school_admin) | ✓ (non-admin roles only) |
| `members.deactivate`     | ✓ (all members) | ✓ (never admins/coordinators) |
| `members.reactivate`     | ✓ (all members) | ✓ (never admins/coordinators) |
| `members.archive`        |      ✓       |      ✗      |
| `members.changeRole`     |      ✓       |      ✗      |
| `members.impersonate`    |      ✓       |      ✗      |
| `team.view` (Team page)  |      ✓       |      ✓      |
| Fees module              |      ✓       |      ✗ (unless Hub later grants `fees.collect`) |
| Control Hub              |      ✓       |      ✗      |

Rules encoded in `can(ctx, capability, targetRole?)`:

- Admins always pass the target-role guard (OR short-circuit).
- Coordinators are blocked from targeting `school_admin` / `coordinator` —
  **no privilege-escalation path** (they can neither create nor disable an
  admin-level account).
- Nobody can deactivate, archive, or impersonate themselves.
- Archive is admin-only (including archiving a coordinator — there is no
  hard DELETE on `school_members` for `authenticated`). The workspace
  `school_admin` cannot be archived.
- Role change is admin-only and cannot grant `school_admin`.
- **One `school_admin` per workspace.** Partial unique index
  `school_members_one_admin_per_school` (`role = school_admin` and
  `archived_at IS NULL`). Seed / school-create is the only grant path.
  Provision, activate, and change-role all refuse `school_admin`. Ownership
  transfer is not built.
- Every privileged mutation writes an `admin_audit_events` row
  (append-only; no UPDATE/DELETE grants to `authenticated`).

## The coordinator role

`coordinator` (UI label: "Coordinator") is delegated staff administration —
the school-office person who manages people and access but isn't the
principal/admin. Industry framing: coordinator / admin officer, common in
Indian schools (Fedena, Entab, MyClassCampus equivalents).

- Enum value lives in `app_role` (migration `0005`, enum-only — must commit
  before any policy uses it, same pattern as `0003 accountant`).
- RLS: `school_members` and `membership_requests` policies
  accept admin **or** coordinator; coordinator writes are additionally
  restricted to non-admin roles at the row level.
- Nav: Home + Team (admin actions hidden **and** server-blocked).
- Not a money role — coordinator does not see Fees.

## Member activation / deactivation

- `school_members.is_active` (boolean, default true).
- **Two enforcement layers:**
  1. App: `getSessionContext` returns `null` for inactive **or archived**
     memberships. Inactive members see a “disabled” screen; archived members
     see a distinct “archived” variant (not “ask admin to re-enable”).
  2. RLS: `private.is_school_member` / `has_school_role` require
     `is_active = true` **and** `archived_at IS NULL`.
- Deactivated members remain visible in the admin directory (status badge
  "Inactive") so they can be reactivated without creating a new account.
- `shares_school_with` intentionally does **not** filter on `is_active` or
  `archived_at` — the directory needs to render deactivated and archived
  profiles.

## Member archive (no hard delete)

Terminal offboarding, distinct from `is_active`. Migration `0008`.

- Columns: `archived_at` + `archived_by` (actor required when archived).
- `archiveMemberAction` sets both plus `is_active = false` in one write.
- Audit action: `member.archive`.
- UI: admin-only **Archive** with confirm (shared `ConfirmDialog`). Hidden for
  the workspace `school_admin`. Coordinators never see it and cannot write
  archive columns (split UPDATE policy). Directory `InfoHint`s explain archive
  vs inactive.
- Archived rows render grey (`bg-muted`), show **Inactive** plus **Archived**,
  and a disabled off Switch. No Login as, no role change, no reactivation.
  Toggle refuses `ARCHIVED`.
- `FOR DELETE` on `school_members` is dropped; `DELETE` is revoked from
  `authenticated`. "Delete coordinator" means archive that coordinator.

## Role change

- `changeMemberRoleAction` (`members.changeRole`, admin only).
- Grantable roles only (`grantableRoles` — no `school_admin`).
- Refuses self-change, archived targets, and targeting the workspace admin.
- Audit action: `member.role_change` with `{ from, to }` in `detail`.
- Directory: admin-only role Select on live, non-self, non-admin rows. Changing
  a role opens a confirm modal that names the new role's access. Managers can
  **Add member** from the directory (username, email, and password set by the
  office). **Reset password** is in Actions for the same managers.

## Login-as (impersonation)

Signed-cookie identity swap — the admin's Supabase session stays intact.

1. Admin clicks **Login as** in the staff directory →
   `startImpersonationAction` (guards: `members.impersonate`, same school,
   target active, target never `school_admin`, not self). Coordinators can
   be viewed-as so an admin can debug a staff account.
2. A signed HttpOnly cookie (`edubridge.impersonation`, HMAC-SHA256,
   30-minute TTL) records `{ targetUserId, targetEmail, schoolId }`.
   `IMPERSONATION_SECRET` must be set in production.
3. `getSessionContext` verifies: the **real** auth user is still an active,
   non-archived admin of that school, the target is still an active
   non-archived non-`school_admin` member — then returns the target's
   `{ userId, role, email }` plus `{ isImpersonating, realUserId, realEmail }`.
4. `withTenant` claims (and therefore RLS) see the **target** identity —
   the admin experiences exactly the target's access, nothing more.
5. Green banner (shell top): "Viewing as … — signed in as …" with **Exit**.
6. Every start/stop writes `impersonate.start` / `impersonate.stop` audit
   rows. Stop-audit uses the privileged `getDb()` path because the session
   identity at that moment is the target, not the admin.

The cookie alone grants nothing: every request re-verifies the real admin
and the live membership rows.

## Username sign-in and creation

**Sign-in:** Supabase Auth is email-based; we keep it that way (bcrypt hashing
and refresh-token rotation are handled by Supabase — never roll our own).
Username lives on **`school_members.username`** (unique **per school**, not a
global `profiles.username`). Resolving a bare username therefore needs the
school — from the workspace URL (`/{slug}/sign-in`) or the optional slug
field on global `/sign-in`. The sign-in form accepts **email or username**;
the server action treats any input without `@` as a username, looks up
`school_members` for that school's slug (`is_active`, `archived_at IS NULL`),
and calls the standard `signInWithPassword` with the member's email. Email
never needs the school field.

**Creation (never random):** office **Add member** (directory) and domain join
(`/join-school`) collect a username. Add member is picked by the office;
domain join is picked by the staff member. Prefill uses a deterministic
suggestion from the email local part
(`features/auth/lib/username.ts`, e.g. `vikram.s@pilot-school.edu` →
`vikram.s`). No generated codes.

**Availability check — one query:** the `UsernameField` component debounces
400 ms after typing stops and calls `checkUsernameAction`, which runs a
single `SELECT … WHERE username = $1` **scoped to the school slug** and
renders ✓ (available) / ✗ (taken) inline. The same check runs server-side
again at submit (before the Supabase account is created), and the
per-school unique index is the final race-safe backstop — a millisecond
collision surfaces as a friendly "just taken" error. Note: the check
endpoint can reveal which usernames exist in that school (standard for
public handles).

## Seeded demo accounts (dev)

Password for all: `TestLogin123!`

| Username            | Email                          | Role         | School   |
| ------------------- | ------------------------------ | ------------ | -------- |
| `pilot-admin`       | admin@pilot-school.edu         | school_admin | Pilot    |
| `pilot-coordinator` | coordinator@pilot-school.edu   | coordinator  | Pilot    |
| `pilot-accountant`  | accountant@pilot-school.edu    | accountant   | Pilot    |
| `pilot-teacher`     | teacher@pilot-school.edu       | teacher      | Pilot    |
| `pilot-staff`       | staff@pilot-school.edu         | staff        | Pilot    |
| `pilot-vikram`      | vikram@pilot-school.edu        | teacher      | Pilot    |
| `pilot-meera`       | meera@pilot-school.edu         | teacher      | Pilot    |
| `oak-admin`         | admin@oakwood.edu              | school_admin | Oakwood  |
| `oak-teacher`       | teacher@oakwood.edu            | teacher      | Oakwood  |
| `platform-owner`    | owner@edubridge.app            | platform_owner (app_metadata) | — |

Plus 50 seeded students (Pilot, `EBS-2024-###`, Indian names, Classes 6–10)
and 15 (Oakwood, `OAK-2024-###`) each with a primary guardian.

## Verification checklist

- [x] Coordinator sees Team + directory; admin-only actions hidden and
      server-blocked (cannot provision/activate admin roles)
- [x] Coordinator deactivate on admin target → blocked (app + RLS)
- [x] Deactivated member's next workspace request → 404
- [x] Impersonation: banner, teacher nav while impersonated, audit rows,
      Exit restores admin
- [x] Username and email sign-in both work (`/{slug}/sign-in` needs no slug
      typed; global `/sign-in` still has the optional school field)
- [x] Cross-tenant: pilot member opening `/oakwood-academy-bridge` → 404
- [x] Family match (headless): `pnpm --filter @repo/db test:family-match` — Pilot `EBS-2024-006`/`2013-06-06` hits; hyphenless `EBS2024006` hits; wrong DOB and Oakwood miss; family cookie does not satisfy staff context
- [x] Archive: admin archives a coordinator → archived screen, directory
      badge, no reactivation; coordinator cannot archive or change roles (`0008`)
- [x] One admin: provision/activate/role-change have no School admin option;
      unique index rejects a second live `school_admin`
