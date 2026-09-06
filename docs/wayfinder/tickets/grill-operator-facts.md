# Grill leftover operator facts

Type: `wayfinder:grilling` (HITL)  
Status: **resolved** (placeholders accepted)

## Question

What grievance mailbox, registered street line, and legal entity name go into constants? When will `LEGAL_ENTITY_NAME` be filled?

## Resolution

Operator chose **fill later** in the planning session. Constants keep:

- `LEGAL_ENTITY_NAME` = `""`
- `LEGAL_DOCS_IN_FORCE` = `false`
- `REGISTERED_ADDRESS` = `""` (street unknown)
- Forum locked: District Court, Jhunjhunu, Rajasthan, PIN 333022
- `GRIEVANCE_EMAIL` / `PRIVACY_EMAIL` derived as `legal@` / `privacy@` + `PLATFORM_DOMAIN` until a real mailbox is named

Draft banner stays on until a human fills the entity and flips `LEGAL_DOCS_IN_FORCE` after review.
