# Admin Access Controls — Coordinator, Activation, Impersonation

> How school admins delegate people-management to coordinators, deactivate
> members instantly, view-as another user, and how username sign-in works.
> The capability map in `apps/edubridge/lib/auth/capabilities.ts` is the
> single source of truth for privileged actions; RLS remains the backstop.

Related: [rbac-model.md](./rbac-model.md) · [auth README](./README.md) ·
[multi-tenancy.md](../multi-tenancy.md)

## Capability map (who can do what)

| Capability               | school_admin | coordinator |
| ------------------------ | :----------: | :---------: |
| `members.viewDirectory`  |      ✓       |      ✓      |
| `members.invite`         | ✓ (any role) | ✓ (non-admin roles only) |
| `members.activate`       | ✓ (any role) | ✓ (non-admin roles only) |
| `members.deactivate`     | ✓ (all members) | ✓ (never admins/coordinators) |
| `members.reactivate`     | ✓ (all members) | ✓ (never admins/coordinators) |
| `members.changeRole`     |      ✓       |      ✗      |
| `members.impersonate`    |      ✓       |      ✗      |
| `team.view` (Team page)  |      ✓       |      ✓      |
| Fees module              |      ✓       |      ✗      |

Rules encoded in `can(ctx, capability, targetRole?)`:

- Admins always pass the target-role guard (OR short-circuit).
- Coordinators are blocked from targeting `school_admin` / `coordinator` —
  **no privilege-escalation path** (they can neither create nor disable an
  admin-level account).
- Nobody can deactivate or impersonate themselves.
- Every privileged mutation writes an `admin_audit_events` row
  (append-only; no UPDATE/DELETE grants to `authenticated`).

## The coordinator role

`coordinator` (UI label: "Coordinator") is delegated staff administration —
the school-office person who manages people and access but isn't the
principal/admin. Industry framing: coordinator / admin officer, common in
Indian schools (Fedena, Entab, MyClassCampus equivalents).

- Enum value lives in `app_role` (migration `0005`, enum-only — must commit
  before any policy uses it, same pattern as `0003 accountant`).
- RLS: `school_members`, `invitations`, and `membership_requests` policies
  accept admin **or** coordinator; coordinator writes are additionally
  restricted to non-admin roles at the row level.
- Nav: Home + Team (admin actions hidden **and** server-blocked).
- Not a money role — coordinator does not see Fees.

## Member activation / deactivation

- `school_members.is_active` (boolean, default true).
- **Two enforcement layers:**
  1. App: `getSessionContext` returns `null` for inactive memberships →
     workspace routes 404 on the next request. No session revocation needed.
  2. RLS: `private.is_school_member` / `has_school_role` require
     `is_active = true` — an inactive member is invisible to every tenant
     policy even if app code regresses.
- Deactivated members remain visible in the admin directory (status badge
  "Inactive") so they can be reactivated without re-inviting.
- `shares_school_with` intentionally does **not** filter on `is_active` —
  the directory needs to render deactivated profiles.

## Login-as (impersonation)

Signed-cookie identity swap — the admin's Supabase session stays intact.

1. Admin clicks **Login as** in the staff directory →
   `startImpersonationAction` (guards: `members.impersonate`, same school,
   target active, target never admin/coordinator, not self).
2. A signed HttpOnly cookie (`edubridge.impersonation`, HMAC-SHA256,
   30-minute TTL) records `{ targetUserId, targetEmail, schoolId }`.
   `IMPERSONATION_SECRET` must be set in production.
3. `getSessionContext` verifies: the **real** auth user is still an active
   admin of that school, the target is still an active non-admin member —
   then returns the target's `{ userId, role, email }` plus
   `{ isImpersonating, realUserId, realEmail }`.
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
`profiles.username` is **globally unique** (unique index), not per-school.
Global uniqueness is what lets a bare username resolve to one account without
asking which school it belongs to — and it trivially guarantees per-school
uniqueness. Prefixing by tenant in seeds (`pilot-admin`, `oak-admin`) keeps
human-friendly handles collision-free. The sign-in form accepts **email or
username**; the server action treats any input without `@` as a username,
resolves it against `profiles`, and calls the standard `signInWithPassword`
with the real email.

**Creation (never random):** both account-creation surfaces — invite
acceptance (`/accept-invite/[token]`) and domain join (`/join-school`) —
collect a username the **user picks**, prefilled with a deterministic
suggestion derived from the email local part
(`features/auth/lib/username.ts`, e.g. `vikram.s@pilot-school.edu` →
`vikram.s`). No generated codes.

**Availability check — one query:** the `UsernameField` component debounces
400 ms after typing stops and calls `checkUsernameAction`, which runs a
single `SELECT … WHERE username = $1 LIMIT 1` against the unique index and
renders ✓ (available) / ✗ (taken) inline. The same check runs server-side
again at submit (before the Supabase account is created), and the
`profiles_username_unique` index is the final race-safe backstop — a
millisecond collision surfaces as a friendly "just taken" error. Note: the
check endpoint can reveal which usernames exist (standard for public
handles); rate-limiting is deferred to Phase 6 hardening.

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
      server-blocked (cannot invite/activate admin roles)
- [x] Coordinator deactivate on admin target → blocked (app + RLS)
- [x] Deactivated member's next workspace request → 404
- [x] Impersonation: banner, teacher nav while impersonated, audit rows,
      Exit restores admin
- [x] Username and email sign-in both work
- [x] Cross-tenant: pilot member opening `/oakwood-academy-bridge` → 404
