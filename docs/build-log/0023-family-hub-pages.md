# 0023 — Family hub pages

**Date:** 2026-08-28

## Goal

After family login, parents see Fees / Progress / Exams / Events under `/family/*` without fake scores or a pay form.

## What changed

- `familyModules` is five items; FamilyShell bottom nav matches.
- Home is a destination hub. Nested `/family/fees|progress|exams|events`.
- Fees reads existing assignment + payments (or honest empty). Progress / Exams / Events wait on academic tables.
- Staff `/fees` still requires Supabase; family cookie does not open it.

## Commands

```bash
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/features/student-dashboard/`
- `apps/edubridge/app/[workspace]/(public)/family/(app)/`
- `apps/edubridge/features/shell/modules.ts`
- `docs/architecture/auth/family-surface.md`

## Next

Slice 2: `parent_links` + Add child. Academic marks/events need Phase 1 tables.
