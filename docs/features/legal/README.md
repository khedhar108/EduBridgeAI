# Legal surfaces

Status: **Done** (draft — not a contract until `LEGAL_DOCS_IN_FORCE`).

Public Terms, Privacy, Cookies, footer, and cookie banner for `apps/edubridge`. Map: [brand-legal-and-consent-surfaces.md](../../wayfinder/brand-legal-and-consent-surfaces.md).

## Routes

- `/terms` `/privacy` `/cookies`

## Constants

| What | File |
|------|------|
| Display name, tagline, domain, cookie prefix | `apps/edubridge/lib/brand.ts` |
| `LEGAL_ENTITY_NAME`, court, emails, versions, `LEGAL_DOCS_IN_FORCE` | `apps/edubridge/lib/legal/constants.ts` |

`LEGAL_ENTITY_NAME` is the contracting party, not the product name. Leave it empty until the operator is named. Do not put it in `brand.ts`. Do not rewrite clause prose to sound nicer.

## Shipped

- [x] `features/legal` module (pages, footer, cookie banner)
- [x] Thin `/terms` `/privacy` `/cookies` routes
- [x] Unchecked required Terms on staff, platform, family, and join
- [x] Consent cookie only (no `legal_acceptances` table)
- [x] Cursor rules `60-legal-brand` + `61-brand-constants`

## Open

- [ ] Fill `LEGAL_ENTITY_NAME` + street in `lib/legal/constants.ts`; advocate review; flip `LEGAL_DOCS_IN_FORCE`
- [ ] Postgres acceptances when migrate is permitted
- [ ] Hindi (or other) legal pages
- [ ] Phase 6 refund / tax / payment subprocessors
