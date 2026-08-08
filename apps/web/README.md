# Mastra starter / demo app

Next.js demo that streams chat to `apps/agent` (Mastra). **Not** the EduBridge product surface.

| | |
|---|---|
| Port | **3002** |
| Product app | [`apps/edubridge`](../edubridge) (port 3000) |

## Dev

```bash
pnpm --filter web dev
# or
pnpm dev:web
```

Requires `apps/agent` running (`pnpm dev:agent`) and optional `MASTRA_API_URL` in `.env.local`.
