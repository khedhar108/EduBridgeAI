# 0016 — RBAC dashboard + admin access controls

**Date:** 2026-08-26

## Goal

Ship the delegated-administration layer: coordinator role, admin dashboard
(staff directory + student roster with activate/deactivate and login-as),
platform-owner console aggregates, username sign-in, and a full two-school
demo seed.

## What changed

- **Migration** `0005` (enum-only: `coordinator`, commits before policies use
  it — same pattern as `0003`) + `0006` (admin access controls):
  `profiles.email` + `profiles.username` (both globally unique), 
  `school_members.is_active`, `admin_audit_events` table, RLS helpers
  (`is_school_member` / `has_school_role`) now require `is_active`,
  coordinator-aware policies on `school_members` / `invitations` /
  `membership_requests` with non-admin-role guards.
- **Capability map** `lib/auth/capabilities.ts` — single source of truth for
  privileged actions (`members.*`, `team.view`); all call sites use
  `can()` / `assertCapability()` instead of scattered role lists.
  Coordinator: invite/activate/deactivate non-admins only; admin retains
  everything incl. impersonation + role changes.
- **Admin dashboard** (`/[workspace]` home): stats row, staff directory
  (name/email/role/status + **Login as** + **Activate/Deactivate**), student
  roster (admission no., class, DOB, guardian, contact) for admin/coordinator.
- **Impersonation**: signed HttpOnly cookie (HMAC-SHA256, 30-min TTL,
  `IMPERSONATION_SECRET`) swaps identity in `getSessionContext` → RLS sees
  the target; green banner + Exit; `impersonate.start/stop` audited.
  Real admin re-verified on every request; targets never admins/coordinators.
- **Member activation**: two layers — `getSessionContext` rejects inactive
  memberships (instant 404) and RLS helpers enforce `is_active`.
- **Username sign-in**: form accepts email or username; username resolves
  via `profiles.username` → real email → standard Supabase
  `signInWithPassword` (bcrypt + refresh rotation stay Supabase-owned).
  Username **creation** on invite-accept and domain-join: user picks the
  handle (prefilled deterministically from the email local part — never
  random) with a debounced single-query availability check (✓/✗ inline);
  server re-checks at submit; unique index is the race-safe backstop.
- **Platform console** `/platform`: read-only aggregates (schools, active
  members, students) via privileged `getDb()` behind `getPlatformContext()`;
  replaces the Phase 0 placeholder. Billing/toggles stay Phase 6.
- **Seed** `pnpm seed:dev`: 2 schools (pilot + oakwood), 10 accounts
  (pgcrypto `crypt()`, idempotent upserts), 50 pilot + 15 oakwood students
  with Indian names/guardians; `DEMO_ACCOUNTS` + docs updated.
- Turbo env: `IMPERSONATION_SECRET` declared; fixed latent lint blockers
  (`inspect-dev-db.mjs` console globals, unused import in seed).

## Commands

```bash
pnpm db:generate -- --name=admin_access_controls   # then hand-split into 0005+0006
pnpm db:migrate                                     # 0005 + 0006 applied
pnpm seed:dev                                       # 2 schools, 10 accounts, 65 students
pnpm lint && pnpm check-types && pnpm build
```

## Key paths

- `packages/db/migrations/000{5,6}_admin_access_controls*.sql`
- `apps/edubridge/lib/auth/capabilities.ts`
- `apps/edubridge/lib/tenancy/{session-context,impersonation}.ts`
- `apps/edubridge/features/auth/{actions/{toggle-member-active,impersonate}.ts,components/staff-directory.tsx,queries/list-members.ts}`
- `apps/edubridge/features/fees/components/students-panel.tsx`
- `apps/edubridge/lib/access/platform-overview.ts` + `app/platform/page.tsx`
- `docs/architecture/auth/admin-controls.md`

## Next

- Fee demo data (plans × versions × assignments × payments) — follow-up branch
- Invite outsider + domain-join e2e smoke → Phase 0 exit
- Phase 1: student dashboard (family admission + DOB)
