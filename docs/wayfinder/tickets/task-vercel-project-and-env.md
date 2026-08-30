# Create Vercel project and env

Type: `wayfinder:task` (HITL)  
Status: **open** (Vercel is staging; Coolify + Hetzner remains production)  
Map: [platform-launch.md](../platform-launch.md)

## Question

Is a staging-only Vercel project connected to this GitHub repo with Production
Branch = `development`, isolated non-production services, and
`dev.edubridge.app` + `*.dev.edubridge.app` attached?

## Checklist (human + agent after research)

1. Follow settings from [How Vercel builds this pnpm monorepo](./research-vercel-turborepo.md).
2. Connect GitHub; set Vercel's Production Branch to `development`. Keep `main`
   deployments disabled in this project; production belongs to Coolify.
3. Set env per environment (Production / Preview / Development):

   - `APP_ENV=staging`
   - `WORKSPACE_ROOT_DOMAIN=dev.edubridge.app`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (pooler)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://dev.edubridge.app`
   - `FAMILY_SESSION_SECRET`, `IMPERSONATION_SECRET`
   - `MASTRA_API_URL=https://agent-staging.edubridge.app` only after that Coolify
     app exists; otherwise omit / leave AI module off
     ([ADR-010](../../decisions/ADR-010-mastra-coolify-host.md))
   - **Do not set `NODE_ENV`** — Vercel’s production build already sets `production`

4. Use a separate staging Supabase project/database, synthetic data, test
   integration keys, and unique signing secrets. Never copy production secrets.
5. Add `dev.edubridge.app` to Vercel, then delegate only that child DNS zone
   using the nameservers Vercel assigns. Attach `*.dev.edubridge.app`.
6. Add the staging apex/wildcard callback URLs to staging Supabase Auth.
7. Confirm build does **not** run `pnpm db:migrate`.
8. Confirm responses carry `X-Robots-Tag: noindex, nofollow, noarchive`.
9. Keep Vercel deployment Git-native; do not add a duplicate deploy job to
   GitHub Actions.

Wildcard `*.dev.edubridge.app` is available on **Hobby and Pro**. Staging traffic
is billed as usage, not per school. Hobby is enough for one wildcard zone unless
the GitHub repo is an **organization** (Hobby cannot attach org repos — use Pro).
Do not buy Enterprise for “multi-tenant preview URLs.”

Official: [limits](https://vercel.com/docs/platforms/multi-tenant-platforms/limits),
[wildcard nameservers](https://vercel.com/kb/guide/why-use-domain-nameservers-method-wildcard-domains),
[platforms](https://github.com/vercel/platforms).
Not our model: [B2B starter](https://vercel.com/templates/other/b2-b-multi-tenant-starter-kit)
(Stack Auth teams). Capacity table: [deployment-environments.md](../../architecture/deployment-environments.md).

## Blocked by

- [How Vercel builds this pnpm monorepo](./research-vercel-turborepo.md)
- Access to add `NS` delegation records under the parent `edubridge.app` zone

## Close when

A green deployment of `development` serves the staging apex, platform host, and
a never-predeclared school host. Auth links stay on the staging apex, noindex is
present, and production data/secrets were never attached. Record the Vercel
project URL and delegated nameservers on this ticket.
