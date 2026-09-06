# 0031 — Workspace URL architecture + platform-launch map

**Date:** 2026-08-29

## Goal

Document path-vs-subdomain dual-mode and an open checkbox map so host rewrite, CI, and plans can land without breaking local `/{slug}` or family cookies.

## What changed

- Architecture: `docs/architecture/workspace-urls.md` (target URLs, today vs deploy-now, cookie rules, slice safety)
- Wayfinder map: `docs/wayfinder/platform-launch.md` plus open research/task/grilling tickets
- Wired ADR-006, Phase 6, platform-boundaries, auth two-doors, auth-local-vs-prod
- **No app code.** `proxy.ts` still path-only. Do not deploy family on path-only production

## Commands

```bash
# docs only — no generate/migrate
```

## Key paths

- `docs/architecture/workspace-urls.md`
- `docs/wayfinder/platform-launch.md`
- `docs/wayfinder/tickets/research-vercel-turborepo.md`
- `docs/roadmap/phase-6-platform-growth.md`

## Next

Slice A on the map — CI workflow — without touching routing. HITL: buy `edubridge.app` / Vercel nameservers.
