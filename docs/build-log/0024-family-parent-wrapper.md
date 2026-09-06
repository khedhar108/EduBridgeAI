# 0024 — Family parent wrapper (Slice 2)

**Date:** 2026-08-28

## Goal

Parents can add a second child (admission + DOB) and switch between linked children without leaving `/family/*`. Still one child on screen.

## What changed

- `parent_links` is a sibling group (`family_id` opaque UUID on the cookie — not an `auth.users` parent).
- Generated `0009_parent-links` + RLS (members SELECT; `school_admin` write). Family writes still use privileged `getDb()`.
- Parent sign-in restores the group. Add child + switcher. Student viewer has no Add child.
- Admin `parent_links` CRUD waits for staff `/students`.

## Commands

```bash
pnpm db:generate -- --name=parent-links
pnpm --filter edubridge check-types
# apply when permitted:
# pnpm db:migrate
```

## Key paths

- `packages/db/src/schema/students.ts`
- `packages/db/migrations/0009_parent-links.sql`
- `apps/edubridge/lib/tenancy/parent-family-group.ts`
- `apps/edubridge/features/auth/actions/add-child.ts`
- `apps/edubridge/app/[workspace]/(public)/family/(app)/add-child/page.tsx`

## Next

`pnpm db:migrate` (permission), then `pnpm db:check` and `pnpm db:rls-test`. Slice 3 is school `/students` + academic tables.
