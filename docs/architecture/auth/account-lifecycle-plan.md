# Account Lifecycle Plan — Archive, Role Change, Toggle UI, Sign-up Login

> Status: **Items 1–4 shipped** (migration `0008_member-archive`, archive +
> change-role, one live `school_admin` per workspace via unique index). Invite
> tokens were removed later — office Add member creates a confirmed auth user
> and keeps the office session. Apply `0008` with
> `pnpm db:migrate` before the new columns are live. Un-archive is intentionally
> not provided (composite PK; archive is terminal). Ownership transfer of the
> workspace admin is not built.

Related: [rbac-model.md](./rbac-model.md) · [admin-controls.md](./admin-controls.md) ·
[README.md](./README.md) · [multi-tenancy.md](../multi-tenancy.md)

## Scope and intent

Four gaps came out of the audit. This plan closes them while keeping RBAC as the
single source of truth and preserving the "never hard-delete a member" rule.

1. **Archive instead of delete** — add a permanent, audited "archived" state that is
   distinct from the reversible `is_active` gate.
2. **Role change + archive permission** — admins can change roles and archive a
   coordinator; coordinators can only manage non-admin roles (no escalation).
3. **Toggle controls in the UI** — replace text-link form submits with real
   toggle/switch controls and confirmation for destructive actions.
4. **Direct sign-up logs the new user in** — domain join should
   establish the Supabase session instead of bouncing the user to sign-in.
   Office Add member keeps the coordinator/admin session (does not sign in as
   the new member).

Out of scope (deferred): public self-registration (Phase 6), parent/student family
access (Phase 1), platform console billing/aggregate writes (Phase 6).

## Current-state facts (from audit)

- `school_members` has `is_active` (default `true`) but **no** archive column.
- Base migration `0000_phase0_core.sql` still defines a `school_members_delete_for_admins`
  `FOR DELETE` policy — so a future delete path could hard-delete rows.
- `toggleMemberActiveAction` flips `is_active` only; the UI calls it "Deactivate/Activate".
- No `members.changeRole` server action exists, even though the capability is defined.
- `capabilities.ts` correctly blocks coordinators from `changeRole`, `impersonate`, and
  targeting admins/coordinators, but there is no archive capability yet.
- `schoolDomainSignUpAction` creates the Supabase user via
  `signUp` then `redirect`, but does not persist a signed-in session, so the new user is
  not "logged in" on landing. Office Add member uses `auth.admin.createUser` and
  never steals the office cookie jar.

## Decision: archive vs. deactivate

Keep two orthogonal signals on `school_members`:

| Column | Meaning | Reversible | Blocks access |
| ------ | ------- | ---------- | ------------- |
| `is_active` | Suspension / temporary offboarding | Yes (reactivate) | Yes, next request |
| `archived_at` (+ `archived_by`) | Permanent archive | No (treated as terminal) | Yes, forever |

Archive is terminal in product terms: an archived member is never reactivated through
the normal toggle; it stays in the directory for audit/history and is excluded from
active counts and access. RLS reads both `is_active = true` and `archived_at IS NULL`.

## Proposed schema change (permission required)

Edit `packages/db/src/schema/school-members.ts` only, then generate:

- Add `archivedAt` (`timestamp with time zone`, nullable, `mode: "date"`).
- Add `archivedBy` (`uuid`, nullable, FK `profiles.id` `onDelete: set null`).
- Add a check that `archived_by` is null when `archived_at` is null
  (`archived_at IS NULL OR archived_by IS NOT NULL`), so archive writes always carry an actor.

RLS updates in the generated SQL (reviewed extension, per rule 13):

- Update `private.is_school_member` / `private.has_school_role` to require
  `archived_at IS NULL` in addition to `is_active = true`.
- Drop `school_members_delete_for_admins` and any other `school_members` `FOR DELETE`
  policy so no tenant role can hard-delete a membership.
- Add/restrict the `school_members` update policy so only `school_admin` can set
  `archived_at`/`archived_by` (coordinators keep non-admin `is_active` toggling only).

### Capability map addition

Add `"members.archive"` and `"members.changeRole"` (already declared) to
`apps/edubridge/lib/auth/capabilities.ts`:

- `members.archive` → `ADMIN_ONLY` (coordinators cannot archive).
- `members.changeRole` → `ADMIN_ONLY` (unchanged).
- Keep `PROTECTED_ROLES = ["school_admin", "coordinator"]` as the coordinator
  escalation guard.

This lets an admin archive a coordinator (the requested "admin can delete coordinator
account"), while coordinators can neither archive nor change roles on admins/coordinators.

## Server actions

### `changeMemberRoleAction` (new, admin only)

- `getSessionContext(workspace)` → `assertCapability(ctx, "members.changeRole", targetRole)`.
- Run inside `withTenant`: read target membership, verify same school, prevent self-demote,
  enforce `archived_at IS NULL` on target.
- `assertCapability` blocks coordinators; the action also refuses `platform_owner`.
- Write `admin_audit_events` (`member.role_change`, before/after role in `detail`).

### `archiveMemberAction` (new, admin only)

- `assertCapability(ctx, "members.archive")`; refuse self-archive; require target is not
  already archived.
- Set `archived_at = now()`, `archived_by = ctx.userId`, and `is_active = false` in one
  `withTenant` transaction.
- Write `admin_audit_events` (`member.archive`, target + role in `detail`).
- UI renders archived members with an "Archived" badge and no reactivation control.

### `toggleMemberActiveAction` (existing, narrowed)

- Add a guard: archived members cannot be reactivated through the toggle
  (`if (member.archivedAt) throw ARCHIVED`).
- Keeps the two-layer enforcement and audit row.

### `provisionMemberAction` / `schoolDomainSignUpAction` (session)

- `provisionMemberAction` creates the auth user with `auth.admin.createUser`
  (`email_confirm: true`) so the office session is never replaced. Password
  is never audited.
- `schoolDomainSignUpAction`: session persistence after domain join remains
  deferred; that path still redirects to `/awaiting-invitation`.

## UI changes

### Staff directory (replace link-forms with controls)

- Import shadcn `Switch` (and `Tooltip`/`AlertDialog` as needed) in
  `features/auth/components/staff-directory.tsx`.
- Active ↔ inactive uses a `Switch` with `defaultChecked={m.isActive}` and a server action
  `onCheckedChange`; disabled for self, archived, and (for coordinators) protected roles.
- "Login as" stays a distinct admin-only action, styled as a button rather than an
  underline link.
- Add an admin-only **Archive** button (confirm dialog) and a **Change role** select/menu
  per row; both hidden for coordinator and non-managers, and server-blocked.

### Pending members panel

- Activation select already exists; keep it but ensure "School admin" option is only
  rendered when the current role is `school_admin` (currently it's hardcoded in the UI —
  the server blocks it, but the UI should not show it to a coordinator).

### Sign-in / sign-up surfaces

- No visual change required beyond the session fix; confirm the new-account flow lands
  signed-in. The `School` field on school sign-in stays optional (email sign-in unchanged).

## Verification

- `pnpm db:check` after any schema edit; ask permission before `pnpm db:generate` and
  `pnpm db:migrate`.
- Re-run `packages/db/scripts/run-rls-test.mjs` (rollback) and extend the isolation test to
  assert archived members lose access.
- `pnpm lint` and `pnpm check-types`.
- Manual: admin archives a coordinator → coordinator's next request 404s, directory shows
  "Archived", no reactivation toggle; coordinator cannot see the archive/role-change controls.

## Migration sequence (when approved)

1. Edit `packages/db/src/schema/school-members.ts` (add archive columns).
2. `pnpm db:generate -- --name=member-archive` — review generated SQL.
3. Extend generated SQL with RLS updates (helper functions require `archived_at IS NULL`,
   drop DELETE policy, restrict archive writes to admin).
4. Ask permission, then `pnpm db:migrate`.
5. Update `capabilities.ts` + actions + UI in the same change set.
6. Update `admin-controls.md` and this plan's status to reflect completion.
