# Getting Started

## Requirements

- Node.js **>=22.13.0** (see `.nvmrc`)
- pnpm **9.15+**

```bash
nvm use
node -v
pnpm -v
```

## Install and run

```bash
git clone <repo-url>
cd aria
pnpm install
pnpm kill:dev            # optional: free leftover :3000 / :4111 / :4983
pnpm dev                 # edubridge + agent → http://localhost:3000
```

## Documentation map

Start at [docs/README.md](../README.md) for the full documentation index.

Deployment: [deployment-environments.md](../architecture/deployment-environments.md)
(`NODE_ENV` is not set in `.env` files).
AI: [ai-platform.md](../architecture/ai-platform.md) — `pnpm dev` starts Next
`:3000` and Mastra `:4111`; hosted AI is a second Coolify service, not Mastra Cloud.

## Next steps

- UI components: [TAILWIND_SHADCN_GUIDE.md](../../TAILWIND_SHADCN_GUIDE.md)
- AI integration: [architecture/ai-platform.md](../architecture/ai-platform.md)
- First AI feature: [features/mastra-integration-via-customer-feedback-summarization-template](../features/mastra-integration-via-customer-feedback-summarization-template/README.md)
