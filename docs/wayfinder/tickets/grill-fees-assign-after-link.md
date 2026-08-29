# Fees assign-after-link + later dual-plan unique index

Type: `wayfinder:grilling`  
Status: **blocked**

Blocked by:

- [`students.register` capability + RLS split](./grill-students-register-capability-rls.md)

SIS create must ship first so someone can still create a student. Then retarget `/fees/register`. Dual-plan unique is a **later Fees-only** migration.

## Question

After SIS exists:

1. Change `/fees/register` to pick an existing `student_id` (search/dropdown) and pin **one** plan (current unique on `student_id` stays). Stop inserting `students` / `student_guardians`.
2. Later, two plans (registration / admission fee vs tuition `once | quarterly | custom`): drop `student_fee_assignments_student_unique`, add unique `(student_id, kind)` with `kind = registration | tuition`. **Not** in the SIS schema PR.

Do not put fee fields on the SIS form. Existing `heads` JSON can still hold line items inside one plan until step 2.
