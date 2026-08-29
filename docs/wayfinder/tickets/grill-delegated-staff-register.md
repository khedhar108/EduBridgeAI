# How is delegated staff granted register

Type: `wayfinder:grilling` (HITL)  
Status: **open**

## Question

Who may run `students.register` besides `school_admin` and coordinator?

Lean: **role-level first** via Control Hub (`students.register` on `staff`) — see [control-hub.md](../control-hub.md) slice 6. One boolean on `school_members` only if “this clerk, not all staff.” Accountant does **not** get this by default — they assign fees later.

Today: Students nav is `school_admin | teacher | staff`. Coordinator cannot open `/students`. RLS `students_write_admin_accountant` allows admin + accountant INSERT and blocks coordinator.

## Blocks

- [`students.register` capability + RLS split](./grill-students-register-capability-rls.md)
