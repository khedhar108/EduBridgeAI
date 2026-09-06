# Legal

Public Terms, Privacy, and Cookie pages, marketing footer, and cookie banner. Display brand: `lib/brand.ts`. Contracting party (`LEGAL_ENTITY_NAME`) and other legal keywords: `lib/legal/constants.ts`. Copy is draft until `LEGAL_DOCS_IN_FORCE`.

## Routes served

- `/terms`
- `/privacy`
- `/cookies`

## Roles

Public. No tenant session required.

## Key files

- `content/terms.ts` — interpolating Terms sections
- `components/site-footer.tsx` — home / modules / blog / legal footer
- `components/cookie-banner.tsx` — Necessary only vs Accept all

## Depends on

- `apps/edubridge/lib/brand.ts`
- `apps/edubridge/lib/legal/`
