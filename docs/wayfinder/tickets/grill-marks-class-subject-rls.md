# When to tighten marks RLS to class-subject

Type: `wayfinder:grilling` (HITL)  
Status: **open**

## Question

`can_access_class` unlocks the whole class if the teacher has any subject there. Tighten to `class_subject` with marks UI, or a dedicated policy PR first?

Lean: with marks UI. Until then assignment rows + UI filter; known ceiling is class-level RLS.
