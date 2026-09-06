# What read-only blocks and which banners

Type: `wayfinder:grilling` (HITL)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)

## Question

When a school’s subscription is `read_only` (trial ended, or paid lapsed after grace), which writes are blocked, which reads stay, and what does the staff banner say — including during `trialing` and `grace`?

## Standing (do not reopen)

- Schools never lose **read** access to their own data (Phase 6 doc).
- Family surface is already read-only; confirm it stays available in `read_only`.
- State transitions only via cron + payment webhooks, never ad-hoc in a page handler.

## Close when

A short table: state → banner copy → blocked capabilities (e.g. all `assertCapability` writes vs a named allowlist). Slice E implements that table; do not invent UX in the schema PR.
