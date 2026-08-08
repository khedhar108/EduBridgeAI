# EduBridge (primary app)

Primary Next.js 16 product app for the EduBridge platform. Port **3000**.

## Stack wiring

| Concern  | How                                                                                    |
| -------- | -------------------------------------------------------------------------------------- |
| UI       | Tailwind v4 + `@repo/ui` (same two-compilation model as `apps/web`)                    |
| AI       | Mastra via `lib/mastra-client.ts` → `MASTRA_API_URL` (default `http://localhost:4111`) |
| Database | `@repo/db` (Drizzle) — set `DATABASE_URL` to Supabase transaction pooler `:6543`       |
| Features | `features/<module>/` — see `docs/guides/feature-folder-structure.md`                   |

## Scripts

```bash
pnpm --filter edubridge dev
# or from root:
pnpm dev:edubridge
```

Development database probe: `http://localhost:3000/db-check`. It reads pilot
school names through server-side Drizzle and returns 404 in production.

## Env

Copy `.env.example` → `.env.local`:

- `MASTRA_API_URL` — agent service
- `DATABASE_URL` — same as `packages/db` (transaction pooler)

## Layout

```
apps/edubridge/
├── app/                 # Thin routes
├── features/
│   ├── shell/           # Module registry + (Phase 0.4) chrome
│   └── _template/       # Copy for new modules
└── lib/                 # Mastra gateway, future auth helpers
```

`apps/web` is the Mastra starter/demo on port **3002** — not the product surface.
