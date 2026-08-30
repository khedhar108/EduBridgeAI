# 0033 — Deployment environments and off-VPS image

**Date:** 2026-08-29

## Goal

Document that Next.js owns `NODE_ENV`, add staging host parsing, and ship a prebuilt Coolify image path so the VPS never compiles.

## What changed

- `APP_ENV` / `WORKSPACE_ROOT_DOMAIN` for `*.dev.edubridge.app` vs `*.edubridge.app`
- Product gates still use `NODE_ENV === "production"` (Vercel staging and Coolify both)
- Standalone Next output, Dockerfile, `/api/live`, one `.github/workflows/ci-cd.yml`

## Commands

```bash
pnpm --filter edubridge test
pnpm --filter edubridge lint
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/lib/deployment-environment.ts`
- `docs/architecture/deployment-environments.md`
- `apps/edubridge/Dockerfile`
- `.github/workflows/ci-cd.yml`

## Next

HITL: Vercel project + `dev.edubridge.app` NS; Coolify pull GHCR. Omit `NODE_ENV` on both.
