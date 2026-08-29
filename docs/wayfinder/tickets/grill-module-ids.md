# Canonical module ids for entitlements

Type: `wayfinder:grilling` (HITL)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)

## Question

What is the frozen list of `module_id` strings for `module_entitlements`, and which ids exist in the shell **today** vs later phases (report cards, test papers, timetable, generative AI)?

## Standing

- Must match (or be mapped 1:1 to) `features/shell/modules.ts` ids so nav hide/show is one lookup.
- Control Hub keys (`fees.view`, …) stay capabilities; do not reuse them as module ids unless we explicitly decide that.
- A school on trial Max should entitle every **shipped** module; unbuilt modules stay in the table as `enabled` but have no nav entry yet.

## Close when

A table: `module_id` | shipped now? | default on Normal / Pro / Max. Slice E seeds from that table.
