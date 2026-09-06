# ADR-010: Mastra OSS server on Coolify (not Mastra Cloud)

**Status:** Accepted  
**Date:** 2026-08-30

## Context

`apps/agent` is a long-running Mastra process (`mastra start`, port 4111).
`apps/edubridge` talks to it over HTTP via `MASTRA_API_URL` ([ADR-001](./ADR-001-mastra-separate-app.md)).
Local storage is a LibSQL file (`mastra.db`). That file cannot follow Vercel
or an ephemeral container.

Mastra Platform (cloud) prices a persistent 24/7 server at **$100 per project**
([pricing](https://mastra.ai/pricing)). A school product needs always-on
streaming. Staging + production would be two projects. Self-hosted **framework**
is Apache 2.0 (“build and host agents anywhere”). The Helm/Studio **platform**
chart is Enterprise-only; we do not need it.

The Hetzner VPS already runs Coolify for Next.

## Decision

1. **Host `apps/agent` as a second Coolify service** on the same VPS. Run
   `mastra start` (OSS). Do not embed Mastra in Next. Do not deploy the agent
   on Vercel.
2. **Do not use Mastra Cloud** for staging or production. Extra always-on fee,
   their Postgres/LibSQL meter, and a second vendor between Next and our DB.
3. **Storage:** LibSQL file locally. `@mastra/pg` + Supabase **session/direct
   `:5432`** and schema `mastra` on staging/production
   ([mastra-supabase-database-architecture.md](../architecture/mastra-supabase-database-architecture.md)).
4. **DNS:** agent hosts stay on the **Hetzner** zone, not the Vercel-delegated
   `dev.edubridge.app` child zone:
   - staging: `https://agent-staging.edubridge.app`
   - production: Coolify internal URL, or `https://agent.edubridge.app`
5. **Until that Coolify service exists:** omit `MASTRA_API_URL` on Vercel and
   Coolify Next. Keep the generative AI module entitlement off. Local
   `pnpm dev` still uses `http://localhost:4111`.

## Consequences

### Benefits

- Zero extra host bill (same VPS). LLM keys stay the real cost.
- Same Coolify/Traefik operations as Next.
- Tenant Postgres stays on Supabase; Mastra memory uses a separate schema.
- Staging Next on Vercel can still reach the agent over HTTPS.

### Trade-offs

- Two Coolify apps to keep alive (Next + agent). Size the VPS for both.
- Agent Dockerfile / GHCR job is not in this ADR; add when the AI module
  turns on.
- Mastra Studio stays local (`mastra dev`). Do not expose Studio publicly.

## References

- [AI platform — where it runs](../architecture/ai-platform.md#where-it-runs)
- [Agent auth](../architecture/auth/agent-auth.md)
- [Mastra pricing](https://mastra.ai/pricing) (Platform vs Self-Hosted)
- [Mastra server deploy](https://mastra.ai/docs/deployment/mastra-server)
