# 0032 — Host rewrite, admin School URL, Coolify+Hetzner docs

**Date:** 2026-08-29

## Goal

Make `{slug}.edubridge.app` / `{slug}.localhost` rewrite onto `[workspace]` without deleting path URLs, show the live host on admin home, and document Coolify on Hetzner as the production path.

## What changed

- `proxy.ts` reads Host / X-Forwarded-Host; school + platform rewrite; 308 strips `/{slug}` prefix
- Family cookie Path is host-aware (not `NODE_ENV`)
- Admin home + welcome card: copyable `{slug}.edubridge.app`
- Docs: Coolify + Hetzner HITL; Vercel tickets parked

## Commands

```bash
pnpm --filter edubridge lint
pnpm --filter edubridge check-types
```

## Key paths

- `apps/edubridge/proxy.ts`
- `apps/edubridge/lib/tenancy/workspace-host.ts`
- `docs/architecture/workspace-urls.md`
- `docs/wayfinder/tickets/task-coolify-hetzner.md`

## Next

HITL: buy `edubridge.app`, VPS + Coolify, wildcard `A` + Traefik DNS-01. Dockerfile when first deploying the container. Slice D post-register host redirect.
