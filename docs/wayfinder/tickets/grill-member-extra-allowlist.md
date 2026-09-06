# Which extras may an admin pin on a member

Type: `wayfinder:grilling` (HITL)  
Status: **open**

## Question

Allowlist of capabilities for per-member extras vs any overridable Hub row?

Lean: same overridable set as Hub (`students.register`, `students.view`, `fees.collect`, `fees.view`, …). Never `fees.structure` on coordinator unless a later grill says yes. Never locked rows (`archive`, `changeRole`, `impersonate`).

## Blocks

- Member grants table (slice 5)
