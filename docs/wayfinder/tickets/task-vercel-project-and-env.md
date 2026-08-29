# Create Vercel project and env

Type: `wayfinder:task` (HITL)  
Status: **parked** (Coolify + Hetzner is the production host; reopen only if we switch)  
Map: [platform-launch.md](../platform-launch.md)

## Question

Is a Vercel project connected to this GitHub repo with Production = `main`, Preview/staging from `development`, and the same secrets local `.env` already uses?

## Checklist (human + agent after research)

1. Follow settings from [How Vercel builds this pnpm monorepo](./research-vercel-turborepo.md).
2. Connect GitHub; Production branch `main`; Preview from PRs; optionally a Staging deployment from `development`.
3. Set env per environment (Production / Preview / Development):

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (pooler)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://edubridge.app` on Production
   - `FAMILY_SESSION_SECRET`, `IMPERSONATION_SECRET`
   - `MASTRA_API_URL` only if the agent is actually reachable; otherwise omit / leave AI module off

4. Confirm build does **not** run `pnpm db:migrate`.
5. Family cookie Path is host-aware; still do not send real parents until `*.edubridge.app` TLS exists on the **chosen** host.

## Blocked by

- [How Vercel builds this pnpm monorepo](./research-vercel-turborepo.md)
- [Buy edubridge.app and delegate nameservers](./task-buy-edubridge-app-dns.md) (for custom domain; project can exist on `*.vercel.app` first)

## Close when

A green production or preview deploy of current `main`/`development` (path URLs still OK). Record the Vercel project URL on this ticket.
