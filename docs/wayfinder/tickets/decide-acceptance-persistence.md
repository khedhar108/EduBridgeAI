# Decide acceptance persistence

Type: `wayfinder:grilling` (HITL)  
Status: **resolved**

## Question

Cookie-only vs `legal_acceptances` table + migrate?

## Resolution

**Cookie-only** for this change (`edubridge.consent`, not HttpOnly, path `/`). A tenant table with RLS would be stronger in a dispute but needs explicit `db:generate` / `db:migrate` permission. Revisit when the operator asks to persist acceptances in Postgres.
