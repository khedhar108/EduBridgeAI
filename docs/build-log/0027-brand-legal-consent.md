# 0027 — Brand, legal, and consent surfaces

**Date:** 2026-08-29

## Goal

Single-file display brand, draft legal pages, homepage footer, cookie banner, and required unchecked Terms acceptance on login/join.

## What changed

- `PLATFORM_NAME` / `COOKIE_PREFIX` in `apps/edubridge/lib/brand.ts`; legal keywords in `lib/legal/constants.ts` (`LEGAL_DOCS_IN_FORCE` false).
- `features/legal`: Terms, Privacy, Cookies, footer, cookie banner (Necessary / Accept all).
- Auth + join forms require Terms; consent cookie only (no `legal_acceptances` table).
- Cursor rule `.cursor/rules/60-legal-brand.mdc`. Wayfinder map in `docs/wayfinder/` (GitHub CLI not installed).

## Commands

```bash
pnpm lint
pnpm check-types
pnpm build
```

## Key paths

- `apps/edubridge/lib/brand.ts`
- `apps/edubridge/lib/legal/`
- `apps/edubridge/features/legal/`
- `.cursor/rules/60-legal-brand.mdc`

## Next

Fill `LEGAL_ENTITY_NAME` and review copy before flipping `LEGAL_DOCS_IN_FORCE`. Optional: persist acceptances in Postgres when migrate is permitted.
