# 0018 — Member archive + role change

**Date:** 2026-08-28

## Goal

Replace hard-delete with terminal archive, and ship admin-only archive
(including coordinators) plus admin-only role change.

## What changed

- Schema: `school_members.archived_at` / `archived_by` + actor check.
  Migration `0008_member-archive` also requires `archived_at IS NULL` in
  `is_school_member` / `has_school_role`, drops the DELETE policy, revokes
  DELETE from `authenticated`, and splits UPDATE so only admins can write
  archive columns.
- Capability `members.archive` (admin only). `archiveMemberAction` sets
  archive columns + `is_active = false`; the workspace `school_admin` cannot
  be archived. Audit `member.archive`.
- `changeMemberRoleAction` (`members.changeRole`); cannot grant
  `school_admin`; self / archived / admin-target guards; audit
  `member.role_change`.
- One live `school_admin` per school: unique index
  `school_members_one_admin_per_school`; invite/activate/accept-invite drop
  that role.
- Staff directory: Switch, Archive confirm, admin role Select, Archived badge.
- Toggle, session context, impersonation, and platform active-count exclude
  archived members.

## Commands

```bash
pnpm db:generate -- --name=member-archive
# then review/extend 0008 RLS
pnpm db:migrate   # needs explicit OK — do not skip
pnpm lint && pnpm check-types
```

## Key paths

- `packages/db/src/schema/school-members.ts`
- `packages/db/migrations/0008_member-archive.sql`
- `apps/edubridge/features/auth/actions/archive-member.ts`
- `apps/edubridge/features/auth/actions/change-member-role.ts`
- `apps/edubridge/features/auth/components/staff-directory.tsx`
- `docs/architecture/auth/admin-controls.md`

## Next

`0008` is applied on EduDatabase. Smoke: archive `pilot-coordinator`
as admin; confirm coordinator UI has no Archive / role Select.
