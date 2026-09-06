# 0034 — Mastra Coolify host (not Cloud)

**Date:** 2026-08-30

## Goal

Record where `apps/agent` runs locally vs staging vs production.

## What changed

- ADR-010: OSS `mastra start` on the Hetzner/Coolify VPS. Not Mastra Cloud ($100/project always-on). Not Vercel.
- `ai-platform.md` now has the env table, DNS (`agent-staging.edubridge.app` on Hetzner, not `dev.`), and secret split.
- Grill ticket closed as decided; Coolify agent Dockerfile still later (when AI entitlement turns on).

## Commands

```bash
# local only — no new host yet
pnpm dev   # Next :3000 + Mastra :4111
```

## Key paths

- `docs/architecture/ai-platform.md`
- `docs/decisions/ADR-010-mastra-coolify-host.md`

## Next

Dockerfile + Coolify apps when the generative AI module is entitled.
