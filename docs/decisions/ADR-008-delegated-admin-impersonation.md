# ADR-008: Delegated administration via coordinator + signed-cookie impersonation

**Status:** Accepted  
**Date:** 2026-08-26

## Context

School admins are the only people-managers in Phase 0 (`provision`, domain-join
activation, `school_members` mutations). Real schools have a second person —
the school-office coordinator / admin officer — who handles day-to-day staff
accounts while the principal/admin retains full authority. We also needed:

- instant, reversible account lockout (activate/deactivate) that does not
  require deleting memberships or waiting for token expiry;
- a "login as" (impersonation) ability so an admin can see exactly what a
  member sees when debugging access complaints;
- username + password sign-in, because school staff think in usernames, not
  email addresses — while Supabase Auth is email-native and owns bcrypt
  hashing and refresh-token rotation (which we must not reimplement).

Two implementation options were considered for impersonation:

1. **Real Supabase session swap** — service-role `admin.generateLink` +
   `verifyOtp` mints a genuine session for the target user. True at every
   layer, but requires `SUPABASE_SERVICE_ROLE_KEY` inside the Next app and a
   fragile stash/restore of the admin's session cookies on exit.
2. **Signed-cookie identity swap** — keep the admin's Supabase session; a
   signed HttpOnly cookie substitutes the *tenant* identity inside
   `getSessionContext()` and the `withTenant()` JWT claims, so RLS evaluates
   the target user. Exit = delete the cookie.

## Decision

1. **Coordinator as a role, not a permissions engine.** Add `coordinator` to
   `app_role` (enum-only migration `0005`, committing before any policy uses
   it — same pattern as `0003 accountant`). Constrain it with a **central
   capability map** (`apps/edubridge/lib/auth/capabilities.ts`) rather than
   per-call-site role lists, so future per-module overrides extend the map
   instead of touching every action. Coordinators can provision, reset passwords, activate,
   deactivate and reactivate **non-admin** members only; they can never
   grant or disable admin/coordinator accounts (no privilege escalation) and
   never see Fees or impersonate.
2. **Two-layer activation gate.** `school_members.is_active` (default true)
   is enforced by (a) `getSessionContext()` returning null → 404 on the very
   next request, and (b) the RLS helpers `is_school_member` /
   `has_school_role` requiring `is_active = true`, so an inactive member is
   invisible to every tenant policy even if app code regresses.
3. **Signed-cookie impersonation** (option 2). HMAC-SHA256 cookie
   (`edubridge.impersonation`, HttpOnly, 30-minute TTL,
   `IMPERSONATION_SECRET` required in production) storing
   `{ targetUserId, targetEmail, schoolId, expiresAt }`. Every request
   re-verifies the *real* auth user is still an active school admin of that
   school and the target is still an active non-admin member; the cookie
   alone grants nothing. A green banner with Exit restores the admin.
   Every start/stop writes an `admin_audit_events` row (append-only table).
4. **Usernames as a resolution layer, not an auth backend.**
   `profiles.username` is **globally unique** (unique index) and the sign-in
   action resolves username → email → standard Supabase
   `signInWithPassword`. Global uniqueness is what allows a bare username to
   identify one account without a school selector, and it trivially implies
   per-school uniqueness (seeded with tenant prefixes: `pilot-admin`,
   `oak-admin`). Password hashing and refresh-token rotation remain entirely
   Supabase-owned. Usernames are **chosen at office create** (Add member) or
   by the user at domain-join (prefilled with a deterministic suggestion from
   the email local part — never generated randomly), with a debounced
   single-query availability check in the form and a server-side re-check
   before account creation; the unique index settles any race.
5. **Platform console reads aggregates only.** `/platform` shows school
   counts (members, students) via the privileged Drizzle connection behind
   `getPlatformContext()`. No tenant row browsing, no billing/module toggles
   (Phase 6), preserving [platform-boundaries.md](../architecture/platform-boundaries.md).

## Consequences

- **Positive:** admin workload is delegable without granting school keys;
  lockout is instant and reversible; impersonation needs no service-role
  secret and demonstrates the member's exact RLS view; usernames work
  without forking the auth stack; every privileged mutation is audited.
- **Negative:** impersonation is "app-layer real" — anything reading
  `requireUser()` directly (not via `getSessionContext`) still sees the
  admin; all tenant code already routes through the session context, and the
  banner makes the mode explicit. The capability map is another place to
  check during review.
- **Risks / mitigations:** cookie forgery (HMAC + timing-safe compare +
  env-gated secret), privilege creep via coordinator (RLS row-level guards
  mirror the app-layer rules), audit gaps (append-only table, no UPDATE/
  DELETE grants).

## Alternatives rejected

- Full RBAC permissions engine (roles × permissions tables) — overkill for
  one delegated role now; the capability map graduates to it without a
  rewrite.
- Supabase Auth `ban_duration` for deactivation — permanent-ban semantics,
  not tenant-scoped, and not reversible from the school admin UI.
- Per-school username uniqueness — requires a school selector at sign-in
  and still needs a global resolution key; global uniqueness is simpler.

## References

- [admin-controls.md](../architecture/auth/admin-controls.md) — capability
  matrix and verification checklist
- [rbac-model.md](../architecture/auth/rbac-model.md) — role table update
- Migration `0005` (enum) + `0006` (tables, columns, RLS) in
  `packages/db/migrations/`
- Build-log [0016](../build-log/0016-rbac-dashboard-admin-controls.md)
