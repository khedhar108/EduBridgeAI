# 0006 — Multi-tenant SaaS boundary docs

**Date:** 2026-08-08

## Goal

Lock identity, tenancy, platform, support-access, folder, and URL contracts before Phase 0.3 auth wiring.

## What changed

- Added `platform-boundaries.md`, `support-access.md`, ADR-006 (prod subdomains + local path)
- Aligned multi-tenancy, RBAC, Phase 0, Phase 6, product vision, feature-folder guide
- No application code; Phase 6 still owns registration, billing, console, grants, DNS

## Commands

```bash
# docs only — no migrate / seed
```

## Key paths

- `docs/architecture/platform-boundaries.md`
- `docs/architecture/support-access.md`
- `docs/decisions/ADR-006-workspace-subdomains.md`
- `docs/roadmap/phase-6-platform-growth.md`

## Next

Phase 0.3 auth wiring in `apps/edubridge` using path-based workspaces; keep host-rewrite-ready per ADR-006.
