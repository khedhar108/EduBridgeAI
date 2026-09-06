# Prototype legal copy

Type: `wayfinder:prototype` (HITL)  
Status: **resolved** (shipped as draft)

## Question

What interpolating Terms / Privacy / Cookies sections should we publish for humans to react to, without treating them as in force?

## Resolution

Section files live in `apps/edubridge/features/legal/content/`. Keywords come from `apps/edubridge/lib/legal/constants.ts`. Documents are **not a contract** until `LEGAL_DOCS_IN_FORCE` is true. A Rajasthan advocate should review before that flip.
