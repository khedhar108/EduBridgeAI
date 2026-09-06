# AI Platform Architecture

How Mastra fits into the EduBridge monorepo: a **separate process**
(`apps/agent`) that the product app (`apps/edubridge`) calls over HTTP.
Browser never talks to Mastra. LLM keys never live in Next.

Related: [agent ecosystem](./agent-ecosystem.md) (orchestrator + sub-agents),
[agent auth](./auth/agent-auth.md) (service tokens),
[Mastra ↔ Postgres](./mastra-supabase-database-architecture.md),
[ADR-001](../decisions/ADR-001-mastra-separate-app.md),
[ADR-010](../decisions/ADR-010-mastra-coolify-host.md) (Coolify, not Mastra Cloud).

## Decision summary

**Mastra runs as `apps/agent`, not inside Next.** Local = `mastra dev` on
`:4111`. Staging/production = second Coolify service on the Hetzner VPS
(`mastra start`). Not Mastra Cloud. Not Vercel. Not inside the Next image.

Until that Coolify service exists, omit `MASTRA_API_URL` on hosted Next and
keep the AI module entitlement off.

## Where it runs

```
Browser  →  apps/edubridge (Next)
              └── MastraClient  (MASTRA_API_URL)
                    └── apps/agent (Mastra :4111)
                          ├── agents / tools / workflows
                          └── storage (LibSQL local · Postgres mastra schema hosted)
                                └── Supabase Postgres
```

| Place | Next | Agent | `MASTRA_API_URL` | Storage |
|-------|------|-------|------------------|---------|
| Local (`pnpm dev`) | `:3000` | `mastra dev` `:4111` | `http://localhost:4111` | LibSQL `file:./mastra.db` |
| Staging (`development` → Vercel) | Vercel | Coolify app **agent-staging** | `https://agent-staging.edubridge.app` | `@mastra/pg`, staging Supabase, schema `mastra`, port **5432** |
| Production (`main` → Coolify) | Coolify Next | Coolify app **agent** | Internal `http://<agent>:4111`, or `https://agent.edubridge.app` | Same, **production** Supabase |

`agent-staging.edubridge.app` and `agent.edubridge.app` are **Hetzner DNS**,
not under the Vercel-delegated `dev.edubridge.app` zone. Vercel Next cannot
reach Coolify’s internal Docker network, so staging needs that public HTTPS
host. Protect it with [agent-auth](./auth/agent-auth.md) (`AGENT_SERVICE_SECRET`
on both Next and the agent). Do not expose Mastra Studio.

### Why not Mastra Cloud

Verified [mastra.ai/pricing](https://mastra.ai/pricing) (2026-08-30):

| Option | Cost to keep a chat API up 24/7 | Fit |
|--------|--------------------------------|-----|
| **Coolify + OSS `mastra start`** | $0 extra (Apache 2.0 “host anywhere”). Pay the VPS you already run. | **Chosen.** |
| Mastra Platform Starter | 24 CPU hours/month then $0.35/hr. Persistent 24/7 = **$100/project**. Staging + prod = two projects. | Too dear for always-on. |
| Mastra Platform Teams | $250/month + same $100 always-on add-on. | No. |
| Self-hosted Mastra **Platform** (Helm/Studio) | Enterprise license. | Overkill. We only need the OSS server. |
| Agent on Vercel | Serverless. File LibSQL dies. Cold starts break streams. | No. |

LLM provider keys stay the usage bill either way. Cloud does not remove that.

### Env (who holds what)

| Secret | Next (`apps/edubridge`) | Agent (`apps/agent`) |
|--------|-------------------------|----------------------|
| `MASTRA_API_URL` | yes | no |
| `AGENT_SERVICE_SECRET` | yes (mint JWT) | yes (verify JWT) |
| `OPENAI_API_KEY` / other model keys | **no** | yes |
| Mastra `DATABASE_URL` (5432 session/direct) | **no** | yes (hosted only) |
| Next `DATABASE_URL` (6543 pooler) | yes | no |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | no |

GitHub Actions still does **not** bake agent secrets. Agent image (when added)
gets runtime env on Coolify, same pattern as Next.

## Why separate backend (not direct integration)

| Factor | Separate `apps/agent` | Direct in Next |
|--------|----------------------|----------------------|
| Scaling | Scale AI service independently | Coupled to Next.js deploy |
| Secrets | API keys stay in agent app | Mixed with frontend bundle risk |
| Studio | `mastra dev` on port 4111 | Harder to use Studio alongside Next |
| Multiple clients | Same agent for web, mobile, CLI | Tied to one frontend |
| Monorepo fit | Matches [Mastra monorepo docs](https://mastra.ai/docs/deployment/monorepo) | OK for MVPs only |

Official Mastra guidance describes two Next.js patterns: [Next.js integration guide](https://mastra.ai/blog/nextjs-integration-guide). We chose **separate backend** for a production monorepo.

## Target topology

```
Browser
  └── apps/edubridge (Next.js :3000)
        └── Server Action / API Route
              └── @mastra/client-js
                    └── apps/agent (Mastra :4111)
                          ├── domain agents / tools
                          └── LibSQL (local) or Postgres `mastra` schema (hosted)
```

## Communication pattern

1. **Browser** never calls Mastra directly with API keys.
2. **`apps/edubridge`** exposes a server-side route or Server Action.
3. **`MastraClient`** in `apps/edubridge/lib/mastra-client.ts` targets
   `MASTRA_API_URL` (local default `http://localhost:4111`; hosted Next throws
   503 if unset).
4. **`apps/agent`** runs agents, tools, memory, and observability.

```typescript
// apps/edubridge — server-side only
import { MastraClient } from "@mastra/client-js";

const client = new MastraClient({
  baseUrl: process.env.MASTRA_API_URL ?? "http://localhost:4111",
});

const agent = client.getAgent("feedbackSummarizer");
const response = await agent.generate("Summarize all customer feedback");
```

For the full connection guide (memory thread fix, model picker, AI UI package layout, and phased plan), see [Mastra Web Connection](./mastra-web-connection.md).

## Template: customer-feedback-summarization

| Resource | Value |
|----------|-------|
| Template | `customer-feedback-summarization` |
| Agent ID | `feedbackSummarizer` |
| Tool | `getFeedbackTool` (`get-feedback`) |
| Studio | http://localhost:4111 |
| Source | [GitHub template](https://github.com/mastra-ai/template-customer-feedback-summarization) |

## Workspace packages (future)

If `apps/agent` imports shared code from `packages/*`, add to Mastra bundler config if needed:

```typescript
export const mastra = new Mastra({
  bundler: {
    transpilePackages: ["@repo/database"],
  },
});
```

See [Mastra monorepo troubleshooting](https://mastra.ai/docs/deployment/monorepo#workspace-packages).

## UI integration options (later)

- **Mastra Client SDK** — server-side calls from `apps/edubridge/lib/mastra-client.ts`
- **`@repo/ai-ui`** — shared AI Elements + model picker ([Mastra Web Connection](./mastra-web-connection.md))
- **AI SDK UI** — streaming chat via `@mastra/ai-sdk` in Next.js API routes
- **CopilotKit / Assistant UI** — agentic UI components

Feature-specific UI flows are documented in [features/mastra-integration-via-customer-feedback-summarization-template](../features/mastra-integration-via-customer-feedback-summarization-template/README.md).

## References

- [Mastra Client SDK](https://mastra.ai/docs/server/mastra-client)
- [AI SDK UI guide](https://mastra.ai/guides/build-your-ui/ai-sdk-ui)
- [Mastra server deploy](https://mastra.ai/docs/deployment/mastra-server)
- [Implementation plan](../features/mastra-integration-via-customer-feedback-summarization-template/implementation-plan.md)
