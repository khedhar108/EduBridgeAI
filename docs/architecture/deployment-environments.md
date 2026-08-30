# Deployment environments

EduBridge uses one application artifact with three deployment identities.
`NODE_ENV` controls security/product gates; `APP_ENV` controls hostname routing only.
Vercel (`development` branch) and Coolify (`main`) both run `NODE_ENV=production`.

Related: [workspace URLs](./workspace-urls.md),
[ADR-006](../decisions/ADR-006-workspace-subdomains.md),
[ADR-009](../decisions/ADR-009-staging-production-topology.md), and the
[platform launch map](../wayfinder/platform-launch.md).

## Locked topology

| Environment | Source | Host | Runtime |
| --- | --- | --- | --- |
| Local | feature branch | `localhost:3000/{slug}` or `{slug}.localhost:3000` | Next dev |
| Staging | `development` | `dev.edubridge.app` and `{slug}.dev.edubridge.app` | Vercel production build |
| Production | `main` | `edubridge.app` and `{slug}.edubridge.app` | Coolify on Hetzner |

Vercel staging is production-like application validation. It does not validate
Coolify, Traefik, or the final container runtime.

## Plan and capacity (not per-tenant)

Wildcard school hosts are **configuration**, not a Vercel “Pro-only multi-tenant
SKU.” Official: [multi-tenant limits](https://vercel.com/docs/platforms/multi-tenant-platforms/limits).

| | Vercel staging | Coolify production |
|--|----------------|--------------------|
| What you buy | A Vercel **plan** + **usage** (bandwidth, function time, builds). Domains inside the plan limit are not extra. | The **Hetzner VPS**. Coolify self-host is free ([install](https://coolify.io/docs/get-started/installation)). |
| Wildcard `*.host` | **All plans.** Needs Vercel nameservers on that zone (we delegate only `dev.edubridge.app`). | Traefik DNS-01 + empty Domain + `HostRegexp`. No Coolify per-tenant fee. |
| Named custom domains | Hobby **50** / Pro unlimited (soft 100k). Staging needs apex + `*.dev.edubridge.app` — well under Hobby. | Unlimited on the box. Capacity is CPU/RAM/disk. |
| Traffic | Idle staging still incurs tiny usage (builds + probes). No tenants ≠ free forever; it is usage, not a tenant tax. | Idle cost is the VPS. More schools = more Next + Postgres (Supabase) load, not more Coolify licenses. |
| Not this | Per-tenant preview URLs (`tenant---branch.yourdomain.dev`) are **Enterprise**. We do not need them; `*.vercel.app` stays path mode. | Compiling Next on the VPS. Pull GHCR. |

Hobby caveat (unrelated to wildcards): a **Hobby** team cannot connect a GitHub
**organization** repo. If the repo is under an org, use a Pro team (or a personal
repo). [Limits](https://vercel.com/docs/limits/overview).

Coolify minimum for the *control plane*: 2 CPU, 2 GB RAM, 30 GB disk. Size the
VPS for Coolify **plus** the Next container (and skip Git-build so deploys do
not spike compile). Founder example on that install page: 4 CPU / 8 GB for
several small apps.

## `NODE_ENV` — Next.js owns it; omit it from every env file

Do **not** set `NODE_ENV` in `apps/edubridge/.env.local`, Vercel Environment
Variables, or Coolify. Next.js sets it from the command you run.

| You run | Next sets `NODE_ENV` | Product gates |
|---------|----------------------|---------------|
| Local `pnpm dev` | `development` | Relaxed: any email, demo accounts, local HMAC fallbacks |
| Vercel (`development` branch) | `production` | Strict: school/business email, real secrets |
| Coolify (`main`) | `production` | Strict: same as Vercel |

The GitHub branch name does not change `NODE_ENV`. Staging is production-like
because Vercel runs `next build`, not because you put `NODE_ENV=production` in
the dashboard.

| Tempting but wrong | Why |
|--------------------|-----|
| `NODE_ENV=development` in `.env.local` | Redundant. `pnpm dev` already sets it. |
| `NODE_ENV=production` on Vercel or Coolify | Next already sets it. Overriding can fight the framework. |
| `NODE_ENV=staging` anywhere | Invalid. Use `APP_ENV=staging` for hostname/routing. |

Set `APP_ENV` and `WORKSPACE_ROOT_DOMAIN` instead. Those choose
`*.dev.edubridge.app` vs `*.edubridge.app`. They do not relax email or secret
rules.

## Environment variables

| Variable | Local `.env.local` | Vercel | Coolify |
| --- | --- | --- | --- |
| `NODE_ENV` | omit (Next sets it) | omit (Next sets it) | omit (Next sets it) |
| `APP_ENV` | `local` or omit | `staging` | `production` |
| `WORKSPACE_ROOT_DOMAIN` | optional | `dev.edubridge.app` | `edubridge.app` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://dev.edubridge.app` | `https://edubridge.app` |
| `MASTRA_API_URL` | `http://localhost:4111` | `https://agent-staging.edubridge.app` when that Coolify app exists; else **omit** | Coolify-internal agent URL, or `https://agent.edubridge.app`; else **omit** |

Public deployments fail closed when `APP_ENV`, workspace root, auth origin,
Supabase browser variables, or signing secrets are missing. Runtime secrets
(`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FAMILY_SESSION_SECRET`,
`IMPERSONATION_SECRET`) stay on the host; they are not baked into the image.

## Security boundaries

- Relaxed behavior only when `NODE_ENV !== "production"` (local `pnpm dev`).
- Vercel staging and Coolify production both use `NODE_ENV=production` and the
  same email/secret/demo rules; they differ by `APP_ENV`, hostname, and data.
- Staging uses a separate Supabase project, synthetic data, and unique signing
  secrets. Never copy production credentials into Vercel.
- Staging sends `X-Robots-Tag: noindex, nofollow, noarchive`.
- Supabase email callbacks use the explicit apex `NEXT_PUBLIC_SITE_URL`; request
  Host headers cannot choose a public callback origin.

## Host and DNS behavior

`WORKSPACE_ROOT_DOMAIN` is routing configuration, not a second brand constant.
The public brand domain remains `PLATFORM_DOMAIN` in
`apps/edubridge/lib/brand.ts`.

For staging, delegate only the `dev.edubridge.app` child zone to the Vercel
nameservers assigned to that project. Keep the parent `edubridge.app` zone and
`*.edubridge.app` production records with Hetzner/Coolify. This gives Vercel
control of:

- `dev.edubridge.app`
- `platform.dev.edubridge.app`
- `*.dev.edubridge.app`

Generated `*.vercel.app` preview URLs stay in path mode because they are not
tenant root domains. They remain useful for pull-request previews without
pretending wildcard tenant DNS is configured.

The app trusts `X-Forwarded-Host` on staging/production because requests arrive
through Vercel or Traefik. Do not publish the application container port
directly. Cookies stay host-only and never set a parent `Domain` attribute.

## Branch and deployment flow

1. Feature branches merge by pull request into `development`.
2. Vercel Git integration deploys `development` to staging.
3. Staging sign-off precedes the `development` to `main` release pull request.
4. Push to `main` runs `.github/workflows/ci-cd.yml`: verify, build a
   standalone image, smoke `/api/live`, publish to GHCR, then trigger Coolify
   to pull. The Hetzner VPS does not compile the application.

One workflow, conditional jobs. Vercel deploys `development` through Git
integration — no second deploy workflow. Database migrations remain a separate,
explicitly approved release operation.

### GitHub secrets (how to open, what to add)

Open: GitHub repo → **Settings** → **Environments** → create/open **`production`**
→ **Environment secrets**. The `publish-image` and `deploy-coolify` jobs use
`environment: production`, so put them **here**, not only under
Settings → Secrets and variables → Actions (repo-wide).

Add **exactly these four** (production Supabase project, not local):

| Name | Why it is in GitHub |
|------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Baked into the Docker image at `next build`. The browser needs it. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same. Anon key is public-by-design; still a secret in GitHub so it is not in git. |
| `COOLIFY_WEBHOOK` | POST after a green image. Copy from the Coolify app’s webhook / deploy URL. |
| `COOLIFY_TOKEN` | `Authorization: Bearer …` if Coolify requires it. |

**Yes, add `NEXT_PUBLIC_*` to GitHub.** “Public” means the **browser** may see them
after the build. It does not mean skip GitHub. `verify` uses dummy values; only
the **image bake** on `main` reads these secrets.

**Do not put these in GitHub Actions:**

| Name | Where it actually goes |
|------|------------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Coolify **runtime** env (and Vercel staging env). Never bake into the image; never commit. Required for office add-member / password reset. |
| `DATABASE_URL` | Coolify / Vercel runtime (pooler). |
| `FAMILY_SESSION_SECRET`, `IMPERSONATION_SECRET` | Coolify / Vercel runtime. |
| `NODE_ENV` | Omit everywhere. |
| Agent / Mastra keys | Not the Next image workflow. Second Coolify service ([ADR-010](../decisions/ADR-010-mastra-coolify-host.md)). Omit `MASTRA_API_URL` until that host exists. Model keys and Mastra `DATABASE_URL` live on the **agent** container, not GitHub Next bake. |

### Monorepo (`apps/edubridge` + `apps/agent`)

This still works. The Dockerfile copies the **repo root** and runs
`pnpm build:edubridge` (`turbo --filter=edubridge...`). That builds the Next app
plus `@repo/ui` / `@repo/db` / `@repo/ai-ui`. It does **not** start Mastra.

| Host | What to set |
|------|-------------|
| Vercel | Root Directory = `apps/edubridge`. Git deploys `development`. No Docker. `MASTRA_API_URL` only after `agent-staging` exists. |
| GitHub Actions | Builds `apps/edubridge/Dockerfile` from repo root. |
| Coolify Next | Pull that GHCR image. One container = Next on port 3000. |
| Coolify agent | Separate service. [Where Mastra runs](./ai-platform.md#where-it-runs). |

Rollback: Coolify pin to the previous GHCR tag (`sha-<commit>`). Do not rebuild
on the VPS.

## Required staging checks

- Apex, platform, and school hosts resolve to the same Vercel project.
- A school host rewrites to the existing `[workspace]` route without changing
  the browser URL.
- `*.vercel.app` and localhost continue to support path mode.
- Staff and family cookies remain isolated by host/path.
- Registration rejects personal inboxes because staging runs production logic.
- Auth email links remain under `https://dev.edubridge.app`.
- Responses carry the staging noindex header.
