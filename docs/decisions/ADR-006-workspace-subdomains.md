# ADR-006: Workspace subdomains with path-based local fallback

**Status:** Accepted  
**Date:** 2026-08-08

## Context

Each school needs an isolated URL that looks like its own instance
(`{school}.edubridge.app`) while the product remains one Next.js app and one
Postgres project with RLS. Phase 0 already uses path-based `/[workspace]` for
local development. Deferring the production hostname story risks rewriting every
route later. Custom domains per school are not required yet.

## Decision

1. **Production**
   - Public / marketing: `edubridge.app`
   - Platform console: `platform.edubridge.app`
   - School workspace: `<slug>.edubridge.app` where `slug` matches `schools.slug`
     and ends with `-bridge` (e.g. `dps-jaipur-bridge.edubridge.app`)
2. **Staging**
   - Public / marketing: `dev.edubridge.app`
   - Platform console: `platform.dev.edubridge.app`
   - School workspace: `<slug>.dev.edubridge.app`
3. **Local development**
   - Path fallback: `localhost:3000/<slug>` and `localhost:3000/platform`
   - No requirement for local wildcard DNS or `/etc/hosts` gymnastics
4. **Routing seam**
   - Next.js `proxy.ts` (Next 16; not deprecated `middleware.ts`) resolves the
     Host header once and rewrites internally to the existing App Router trees
     (`[workspace]`, `platform`, marketing). Feature modules always receive the
     same workspace slug parameter in prod and dev.
5. **Authorization**
   - Hostname/slug only **selects** the school candidate. Access still requires
     `school_members`, platform admin row, or an active support grant.
6. **Out of scope**
   - Customer custom domains (CNAME) — future ADR if needed
   - Separate deployments per school

## Consequences

### Pros

- Marketing-friendly school URLs without physical multi-app isolation.
- Phase 0 can ship path-based workspaces; Phase 6 adds wildcard DNS + host
  rewrite without moving feature folders.
- Platform console stays on a distinct host, reducing accidental tenant/console
  confusion.

### Cons / follow-up

- Production needs wildcard TLS and DNS (`*.edubridge.app`) on Coolify/Hetzner
  ([workspace-urls.md](../architecture/workspace-urls.md)).
- Staging needs delegated child-zone DNS and wildcard TLS for
  `*.dev.edubridge.app` on Vercel.
- Cookie domain / SameSite strategy must be designed so auth works across
  apex and subdomains (document at Phase 6 implement time).
- Reserved subdomains (`www`, `platform`, `api`, `app`, …) must never collide
  with school slugs — enforce in slug validation.

## Implementation notes (Phase 6)

Open checkboxes: [platform-launch.md](../wayfinder/platform-launch.md).
Architecture: [workspace-urls.md](../architecture/workspace-urls.md).

- [x] Path-based `/[workspace]` for local (Phase 0)
- [x] Slug ends `-bridge`; reserved names blocked at registration
- [ ] Wildcard DNS + certificate for `*.edubridge.app` (Coolify Traefik DNS-01 on Hetzner)
- [ ] Child-zone delegation + wildcard staging domain for `*.dev.edubridge.app` (Vercel)
- [x] `proxy.ts`: map `platform.*` → `/platform/*`; map school subdomains →
  `/[workspace]/…` after validating slug shape; reject unknown reserved names
- [x] Keep path URLs working in local/non-prod (do not delete `[workspace]` routes)
- [x] Host-aware family cookie Path (do not key off `NODE_ENV` alone)
- [x] Cookie domain: never `Domain=.edubridge.app`

## References

- [platform-boundaries.md](../architecture/platform-boundaries.md)
- [multi-tenancy.md](../architecture/multi-tenancy.md)
- [phase-0-foundation.md](../roadmap/phase-0-foundation.md) (path OK until Phase 6)
- [phase-6-platform-growth.md](../roadmap/phase-6-platform-growth.md) (§6.6)
- [workspace-urls.md](../architecture/workspace-urls.md)
- [ADR-005](./ADR-005-primary-app-edubridge.md)
