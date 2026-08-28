# 0022 — Family home chrome (Slice 1)

**Date:** 2026-08-28

## Goal

Signed-in family cookie lands on `/{slug}/family/home` inside FamilyShell, not a confirmation panel on the door.

## What changed

- New `features/student-dashboard` with `FamilyShell` + `FamilyHome` (identity only; no charts).
- Nested `(app)` layout gates `/family/*` with `requireFamilySession`; door stays form-only.
- `familyModules` (Home) in the shell registry. Sign-in redirects to `/family/home`.
- Family cookie still does not satisfy staff Team/Fees.

## Commands

```bash
pnpm --filter edubridge lint
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/features/student-dashboard/`
- `apps/edubridge/app/[workspace]/(public)/family/`
- `apps/edubridge/features/shell/modules.ts`
- `docs/architecture/auth/family-surface.md`

## Next

Slice 2: `parent_links` + Add child + switcher. Ask before `db:generate` / migrate.
