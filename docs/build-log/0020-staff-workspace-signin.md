# 0020 — Staff workspace sign-in

**Date:** 2026-08-28

## Goal

School-from-URL staff door: username + password on `/{slug}/sign-in`, still
ending in `signInWithPassword`.

## What changed

- Split `[workspace]` into `(staff)` (session + `ShellLayout`) and `(public)`
  (`/{slug}/sign-in` outside the shell).
- `proxy.ts`: unauthenticated staff `/{slug}` → `/{slug}/sign-in?next=…`.
  `/{slug}/sign-in` and `/{slug}/family` need no Supabase user.
- Username lookup uses hidden `workspace` (or global optional slug); requires
  `archived_at IS NULL`. Email still needs no school.

## Commands

```bash
pnpm --filter edubridge lint
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/app/[workspace]/(public)/sign-in/page.tsx`
- `apps/edubridge/app/[workspace]/(staff)/layout.tsx`
- `apps/edubridge/proxy.ts`
- `apps/edubridge/features/auth/actions/sign-in.ts`

## Next

Family cookie helpers + headless admission/DOB match (no family UI page).
