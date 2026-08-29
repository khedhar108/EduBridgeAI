# Student/guardian schema + student_documents paths

Type: `wayfinder:grilling`  
Status: **blocked**

Blocked by:

- [Required vs optional field inventory](./grill-required-vs-optional-fields.md)
- [Identity proof: type list and file vs number](./grill-identity-proof-type-and-file.md)

Aadhaar number vs file is already resolved: [What PII we may store for Aadhaar](./research-aadhaar-pii.md).

## Question

Which columns land on `students` vs `student_guardians` vs a `student_documents` table? Storage paths (not bytes). Reuse existing tables; do not invent a second student identity.

Ask before `pnpm db:generate`. Do not change `student_fee_assignments_student_unique` in this PR.

## Blocks

Implementation of `/{slug}/students/new` (out of scope until this ticket and capability/RLS close).
