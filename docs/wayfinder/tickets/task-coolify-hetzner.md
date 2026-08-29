# Coolify on Hetzner for edubridge.app

Type: `wayfinder:task` (HITL)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)  
Architecture: [workspace-urls.md](../../architecture/workspace-urls.md)

## Question

Is Coolify running on a Hetzner VPS with apex + `*.edubridge.app` pointing at that box, Traefik DNS-01 (Hetzner token) issuing a wildcard cert, and **one** application receiving every school Host?

App rewrite is already in `proxy.ts`. This ticket is DNS, TLS, and the Coolify app — not more Next route edits.

## Why this host

Wildcard SaaS = one container, many Hosts. Coolify documents that shape ([SaaS HostRegexp](https://coolify.io/docs/knowledge-base/proxy/traefik/wildcard-certs#saas--route-every-subdomain-to-one-application)). Hetzner is a first-class DNS-01 provider tab in Coolify ([DNS challenge](https://coolify.io/docs/knowledge-base/proxy/traefik/dns-challenge)). Tenant Postgres stays on **Supabase**.

## Checklist (human)

1. Create/confirm a Hetzner Cloud VPS (Ubuntu). Note the IPv4 (and IPv6 if used).
2. Install Coolify on that VPS. Firewall: 22, 80, 443.
3. Own `edubridge.app` ([buy domain](./task-buy-edubridge-app-dns.md)).
4. DNS:
   - `A` `@` (apex) → VPS IPv4
   - `A` `*` → same IPv4
   - Optional `AAAA` if the VPS has IPv6
5. Coolify Traefik: switch ACME to **DNS-01**, provider **Hetzner**, paste a DNS API token with zone rights for `edubridge.app`.
6. Confirm a cert covering `edubridge.app` and `*.edubridge.app` (not one cert per school).
7. Coolify app for `apps/edubridge` (when Dockerfile/standalone exists):
   - Domain field **empty**
   - Custom labels so Traefik `HostRegexp` sends **every** subdomain to this app
   - Listen / published port **3000**
   - `HOSTNAME=0.0.0.0`
   - Env: Supabase + pooler `DATABASE_URL` + `FAMILY_SESSION_SECRET` + `IMPERSONATION_SECRET` + `NEXT_PUBLIC_SITE_URL=https://edubridge.app`
8. Do **not** use Cloudflare Tunnel for tenant hosts. Grey-cloud DNS only is OK.
9. After the app is reachable: [Supabase Auth URLs](./task-supabase-auth-urls.md).

## Do not

- Point nameservers at Vercel **and** A-record the zone to Hetzner
- Put tenant data Postgres on the VPS
- Run `pnpm db:migrate` inside the Coolify build
- Expect `{slug}.edubridge.app` to open before step 4–6 even though `proxy.ts` is ready
- Enable `apps/agent` until [grill-agent-hosting.md](./grill-agent-hosting.md) closes

## Blocked by

- [Buy edubridge.app](./task-buy-edubridge-app-dns.md) (can proceed on VPS install in parallel)
- Dockerfile / `output: "standalone"` when you first **deploy** (not for local `{slug}.localhost` tests)

## Close when

`https://edubridge.app` serves marketing, `https://{pilot-slug}.edubridge.app/sign-in` opens the chooser, TLS is valid for a slug that was never added as its own Coolify domain. Record VPS IP + Coolify project name here.
