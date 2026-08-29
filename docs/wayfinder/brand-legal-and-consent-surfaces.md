# Brand, legal, and consent surfaces

Label: `wayfinder:map`  
Tracker: local markdown (`gh` is not installed on this machine; GitHub issues were not created).

## Destination

EduBridge can rename the public brand in one file, ship industry-standard legal pages and consent UX, and keep those words from being casually rewritten — while remaining honest that documents are not in force until the operator is named.

## Notes

- Domain: brand constants, DPDP-aware legal copy, footer, cookie banner, login Terms acceptance, Cursor rule.
- Skills: `edubridge-erp-landscape`, feature-folder, `create-rule`.
- Standing: `LEGAL_ENTITY_NAME` empty; `LEGAL_DOCS_IN_FORCE` false; Terms checkbox required and **unchecked**; exclusive forum District Court, Jhunjhunu, Rajasthan, PIN 333022; cookie banner Necessary only vs Accept all.
- This effort **carries execution** after the tickets below (user asked to implement in the same change). Cookie-only acceptance persistence (no `legal_acceptances` table; migrate not permitted in this change).

## Decisions so far

- [x] [Research DPDP fiduciary vs processor wording](./tickets/research-dpdp-fiduciary-vs-processor.md) — School is Data Fiduciary; platform is Data Processor; student family-door is residual risk owned by the school.
- [x] [Grill leftover operator facts](./tickets/grill-operator-facts.md) — Entity, street, and grievance mailbox stay placeholders until the operator names them; PIN 333022 / Jhunjhunu / Rajasthan are locked for the forum clause.
- [x] [Prototype legal copy](./tickets/prototype-legal-copy.md) — Interpolating section files shipped as **draft, not in force**.
- [x] [Prototype footer, banner, checkbox](./tickets/prototype-legal-ui.md) — Footer, cookie banner, unchecked Terms checkbox on every login/join gate.
- [x] [Decide acceptance persistence](./tickets/decide-acceptance-persistence.md) — Consent cookie only until a migrate is explicitly permitted.
- [x] [Implement brand legal consent](./tickets/implement-brand-legal-consent.md) — `lib/brand.ts`, `lib/legal/`, `features/legal`, auth forms, Cursor rules `60-legal-brand` + `61-brand-constants`.

## Open

- [ ] Name `LEGAL_ENTITY_NAME` + street; human review; then flip `LEGAL_DOCS_IN_FORCE`.
- [ ] Persist acceptances in Postgres when migrate is permitted.
- [ ] Hindi (or other) legal pages.
- [ ] Phase 6 refund / tax invoice terms.
- [ ] WhatsApp / Razorpay subprocessors when those phases land.
- [ ] EU representative (not appointed).

## Out of scope

- Native-app store policies.
- Payment-gateway ToS.
- Renaming production cookie names when the display brand changes.
- Cloning competitor legal PDFs.
- Implementing Phase 6 billing.
