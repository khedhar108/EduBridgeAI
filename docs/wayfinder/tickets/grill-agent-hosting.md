# Where the Mastra agent runs in production

Type: `wayfinder:grilling` (HITL)  
Status: **decided** (2026-08-30)  
Map: [platform-launch.md](../platform-launch.md)  
Decision: [ADR-010](../../decisions/ADR-010-mastra-coolify-host.md)  
Architecture: [ai-platform.md — where it runs](../../architecture/ai-platform.md#where-it-runs)

## Decision

Second Coolify service on the **same Hetzner VPS**. OSS `mastra start`
(Apache 2.0). Not Mastra Cloud ($100/project always-on). Not Vercel.
Not inside the Next image.

| Env | Agent host | Storage |
|-----|------------|---------|
| Local | `localhost:4111` | LibSQL file |
| Staging | `https://agent-staging.edubridge.app` (Hetzner DNS) | `@mastra/pg`, staging Supabase, schema `mastra`, `:5432` |
| Production | Coolify internal, or `https://agent.edubridge.app` | same, production Supabase |

Until that Coolify app exists: omit `MASTRA_API_URL` on hosted Next; keep
generative AI entitlement off.

## HITL leftover (when the AI module turns on)

1. Dockerfile for `apps/agent` + GHCR tag (or Coolify build from `mastra start` — prefer image, same as Next).
2. Coolify apps `agent` and `agent-staging`; Traefik hosts above.
3. Runtime env on the agent: `DATABASE_URL` (5432), model keys, `AGENT_SERVICE_SECRET`.
4. Set `MASTRA_API_URL` + `AGENT_SERVICE_SECRET` on Vercel (staging) and Coolify Next (prod).
5. Do not publish Mastra Studio.

## Why this was HITL

File-backed LibSQL cannot run on Vercel. A human had to pick cost vs ops.
Picked: reuse the VPS.
