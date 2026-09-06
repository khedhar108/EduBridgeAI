# 0025 — Office-created staff accounts

**Date:** 2026-08-28

## Goal

Coordinators and admins create staff logins (username, email, password, role) and reset passwords from the directory. Invite tokens are gone.

## What changed

- Service-role helper creates confirmed Auth users and updates passwords. Office session stays signed in.
- Staff directory: Add member + Reset password. Capabilities `members.provision` / `members.resetPassword`.
- Invite actions, accept route, and `members.invite` removed. Domain join (`/join-school` → Team activate) stays.
- Schema drops `invitations`. Generated `0011_drop-invitations` (not migrated yet).

## Commands

```bash
pnpm db:generate -- --name=drop-invitations
pnpm --filter edubridge check-types
# apply when permitted:
# pnpm db:migrate
```

## Key paths

- `apps/edubridge/lib/auth/supabase-admin.ts`
- `apps/edubridge/features/auth/actions/provision-member.ts`
- `apps/edubridge/features/auth/actions/reset-member-password.ts`
- `packages/db/migrations/0011_drop-invitations.sql`

## Next

`pnpm db:migrate` (permission) so the `invitations` table is dropped. Set `SUPABASE_SERVICE_ROLE_KEY` in `apps/edubridge/.env.local`.
