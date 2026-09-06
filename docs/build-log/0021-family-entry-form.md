# 0021 — Family entry form

**Date:** 2026-08-28

## Goal

Two-door family sign-in at `/{slug}/family` (admission + DOB), documented.

## What changed

- `FamilySignInForm` + `familySignInAction` issue `edubridge.family` cookie.
- Confirmation panel after match (no dashboard). Staff sign-in links to family.
- Docs: two-door table in auth README; family-access / feature-module / strategy.

## Commands

```bash
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/app/[workspace]/(public)/family/page.tsx`
- `apps/edubridge/features/auth/components/family-sign-in-form.tsx`
- `apps/edubridge/features/auth/actions/family-sign-in.ts`
- `docs/architecture/auth/README.md`

## Next

Phase 1 student dashboard on this session. Seed check: `EBS-2024-006` / `2013-06-06`.
