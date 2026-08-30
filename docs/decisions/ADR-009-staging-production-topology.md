# ADR-009: Vercel staging and Coolify production topology

**Status:** Accepted  
**Date:** 2026-08-29

## Context

The `development` branch needs a production-mode environment where wildcard
tenant hosts behave like the end-user product. Production remains on a Hetzner
VPS managed by Coolify. Compiling the Turborepo/Next.js application on that VPS
would compete with the running service for memory.

Using Vercel and Hetzner for the same DNS zone would also create ownership
conflicts if both were expected to control `edubridge.app`.

## Decision

1. Vercel is application staging:
   - Vercel's Production Branch is `development`.
   - Staging uses `dev.edubridge.app` and `*.dev.edubridge.app`.
   - Only the `dev.edubridge.app` child DNS zone is delegated to Vercel.
   - Staging uses a production build and separate non-production data/secrets.
2. Coolify on Hetzner is production:
   - `main` releases to `edubridge.app` and `*.edubridge.app`.
   - Production DNS remains outside the delegated staging child zone.
   - A later release workflow builds the Docker image on GitHub and publishes
     it to GHCR; Coolify pulls the image instead of building on the VPS.
3. GitHub automation starts as one workflow:
   - verification runs for `development` and `main`;
   - image publish, smoke, and Coolify deploy jobs run only for `main`;
   - Vercel deploys through its Git integration, not a duplicate workflow.
4. `NODE_ENV` remains framework-owned. Never set it in `.env.local`, Vercel,
   or Coolify. `APP_ENV` distinguishes staging from production hostnames.
   Local conveniences apply only when Next sets `NODE_ENV=development`
   (`pnpm dev`).
5. Database migrations never run during build, CI verification, or app boot.

## Consequences

### Benefits

- Staging exercises production email, cookie, secret, and hostname behavior.
- The production VPS spends memory on serving traffic, not compiling Next.js.
- Child-zone delegation prevents Vercel from controlling production DNS.
- One conditional workflow is easier to operate while retaining job-level
  production permissions and environment approvals.

### Trade-offs

- Vercel does not reproduce Coolify/Traefik/container behavior.
- Staging requires its own Supabase project and integration credentials.
- Docker image smoke testing is still required before a production deployment.
- The release workflow may be split later if separate teams need independent
  ownership or approval boundaries.

## References

- [Deployment environments](../architecture/deployment-environments.md) (plan vs usage vs VPS)
- [Workspace URLs](../architecture/workspace-urls.md)
- [Platform launch map](../wayfinder/platform-launch.md)
- [ADR-006](./ADR-006-workspace-subdomains.md)
- [ADR-010](./ADR-010-mastra-coolify-host.md)
- [Vercel multi-tenant limits](https://vercel.com/docs/platforms/multi-tenant-platforms/limits)
- [Coolify installation](https://coolify.io/docs/get-started/installation)
