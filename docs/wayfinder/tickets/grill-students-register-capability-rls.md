# students.register capability + RLS split

Type: `wayfinder:grilling`  
Status: **blocked**

Blocked by:

- [How is delegated staff granted register](./grill-delegated-staff-register.md)

## Question

Add `students.register` (and nav) so coordinator and later delegated staff can open Students **without** opening Fees. Split student write policy from money write policy. Do **not** fold coordinator into `MONEY_ROLES`.

Today `students_write_admin_accountant` is the INSERT backstop — accountant can create students; coordinator cannot. After SIS ships, accountant must lose student INSERT (Fees stops creating people).

## Blocks

- [Fees assign-after-link + later dual-plan unique index](./grill-fees-assign-after-link.md) (cutover needs the capability live so someone can still create students)
