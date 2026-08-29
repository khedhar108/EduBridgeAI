# How Vercel builds this pnpm monorepo

Type: `wayfinder:research` (AFK)  
Status: **parked** (optional — production host is Coolify + Hetzner)  
Map: [platform-launch.md](../platform-launch.md)

## Question

What exact Vercel project settings does `apps/edubridge` need in this Turborepo (root directory, install command, build command, output, Node 22, `transpilePackages` for `@repo/*`) so `main` deploys without breaking local `pnpm dev`?

## Notes

- Root: `pnpm@9.15.4`, Node `>=22.13.0`, `pnpm build:edubridge` / filter `edubridge...`
- Next config today has **no** `output: "standalone"` — required for Coolify Docker; Vercel does not need it
- No `vercel.json` in the repo yet
- Do not recommend `pnpm db:migrate` in the Vercel build
- Capture: env var names already used (`NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, Supabase keys, `FAMILY_SESSION_SECRET`, `IMPERSONATION_SECRET`, `MASTRA_API_URL`)

## Blocked by

None.

## Close when

A short resolution on this ticket: settings table + any repo file we must add (`vercel.json` or not). Then [Create Vercel project and env](./task-vercel-project-and-env.md) can proceed.
