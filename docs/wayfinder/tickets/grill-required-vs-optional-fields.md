# Required vs optional field inventory

Type: `wayfinder:grilling` (HITL)  
Status: **open**

## Question

What is required (`*`) vs optional on `/{slug}/students/new`?

Lean already in the map (confirm or override):

- Father and mother as **two guardian rows** vs one row + relationship enum
- Phones: whose, how many, required?
- Current vs permanent address: both, copy-if-same, optional permanent?
- Photo optional?
- Birth certificate optional?

Admission number, display name, and DOB already exist on the thin Fees create — treat those as `*` unless this grill says otherwise.

## Blocks

- [Student/guardian schema + `student_documents` paths](./grill-student-guardian-schema.md)
