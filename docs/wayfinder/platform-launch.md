# Platform launch (workspace URLs + CI + plans)

Label: `wayfinder:map`  
Tracker: local markdown.

Canonical architecture: [workspace-urls.md](../architecture/workspace-urls.md).  
Phase file: [phase-6-platform-growth.md](../roadmap/phase-6-platform-growth.md).  
Decision: [ADR-006](../decisions/ADR-006-workspace-subdomains.md).  
HITL host: [Coolify + Hetzner](./tickets/task-coolify-hetzner.md).

## Destination

A founder registers on `edubridge.app`, lands on `{slug}.edubridge.app`, and staff/family use that host (`/sign-in`, `/family/home`). Local `localhost:3000/{slug}` still works. Push to `main` deploys on **Coolify** (Hetzner VPS). New schools get a 15-day Max trial; module flags hide report cards / test papers / timetable / AI until the school’s plan (or owner override) entitles them. Path-based routing is never deleted. Admin home shows `{slug}.edubridge.app` so the URL is visible before DNS is live.

## Status

### Done

- [x] Phase 6.1 thin slice — public `/register`, OTP, `-bridge` slug, atomic school + first admin
- [x] Architecture doc [workspace-urls.md](../architecture/workspace-urls.md)
- [x] This map charted
- [x] Slice C — `proxy.ts` host rewrite + **host-aware** family cookie Path + admin School URL card; path URLs still work on localhost

### Left (do in this order — do not skip)

- [ ] Slice A — CI gates (`pnpm lint`, `check-types`, `build`) without changing routing
- [ ] Slice B — HITL: own `edubridge.app`, Coolify on Hetzner, `A` + `*.` to the VPS, Traefik DNS-01, Supabase Site URL + redirect URLs
- [ ] Slice D — production post-register redirect to `https://{slug}.edubridge.app`
- [ ] Slice E — `plans` + `subscriptions` + `module_entitlements` + 15-day Max trial on provision + shell/write gate + read-only + daily cron
- [ ] Slice F — production smoke: register → subdomain; family persist; two-school RLS; local path still works

Family on a path-only host is safe (cookie Path follows Host). `{slug}.edubridge.app` still needs slice B DNS/TLS before parents use it.

## Notes

- This map **carries execution**. Close one slice per session unless the slice is HITL-only (B) or research (parallel OK).
- Skills: `edubridge-git`, `nextjs-supabase-auth`, `supabase-postgres-best-practices`. Ask before `db:generate` / `db:migrate`.
- Domain is `edubridge.app`. Host is the **slug**. Hosting: Coolify + Hetzner. Plans: paid Normal/Pro/Max + 15-day Max trial (no free tier).
- Control Hub capabilities ≠ module entitlements. Do not store plan flags in `capability_overrides`.
- `pnpm db:migrate` never in CI.
- Family cookie: never `Domain=.edubridge.app`. Path is host-aware.

## Implementation roadmap (what to modify)

| Slice | Modify | Do not touch |
| --- | --- | --- |
| **0 — done** | This map, [workspace-urls.md](../architecture/workspace-urls.md), indexes | — |
| **A** | `.github/workflows/ci.yml`; optional `apps/agent` packageManager align | `proxy.ts`, cookies, `packages/db` |
| **B** | Coolify + DNS + TLS + Supabase Auth URLs (no more rewrite code) | Mixing Vercel nameservers with Hetzner `A` records |
| **C — done** | [proxy.ts](../../apps/edubridge/proxy.ts); host-aware family Path; admin home URL | Removing `[workspace]` routes; billing tables; `Domain=` on cookies |
| **D** | [redirects.ts](../../apps/edubridge/features/auth/lib/redirects.ts), [public-origin.ts](../../apps/edubridge/lib/auth/public-origin.ts), register actions | Local still redirects to `/{slug}` |
| **E** | New schema files + generate; [provision-school.ts](../../apps/edubridge/lib/tenancy/provision-school.ts); shell `modulesForSession`; `assertModuleEntitled`; cron route | Control Hub RLS; Fees ledger; SIS form |
| **F** | Smoke only; build-log | New features |

## Decisions so far

- Production host is `{slug}.edubridge.app` ([ADR-006](../decisions/ADR-006-workspace-subdomains.md)) — slug, not display name; domain `.app` not `.com`.
- Local keeps path URLs forever; rewrite is additive.
- Hosting: **Coolify on Hetzner**. Vercel is a compatible alternative (same rewrite), not the plan.
- Plans: paid Normal / Pro / Max, 15-day Max trial, then read-only — not a Free tier.
- School admin uses the staff chooser. Global `/sign-in` is a staff bookmark only.

## Open tickets (frontier — take these first)

- [Buy edubridge.app and point DNS at Hetzner](./tickets/task-buy-edubridge-app-dns.md)
- [Coolify on Hetzner for edubridge.app](./tickets/task-coolify-hetzner.md)
- [Where the Mastra agent runs in production](./tickets/grill-agent-hosting.md)
- [Razorpay vs Stripe for India upfront billing](./tickets/research-payment-provider.md) — needed before 6.4, not before DNS
- [What read-only blocks and which banners](./tickets/grill-read-only-ux.md)
- [Canonical module ids for entitlements](./tickets/grill-module-ids.md)

Vercel research stays optional: [How Vercel builds this pnpm monorepo](./tickets/research-vercel-turborepo.md) — only if we switch hosts.

## Blocked (do not implement until parents close)

- [Supabase Auth Site URL and redirects](./tickets/task-supabase-auth-urls.md) — blocked by a live apex (`edubridge.app` on Coolify)
- [Create Vercel project and env](./tickets/task-vercel-project-and-env.md) — **not on the Coolify path**; keep if we ever move to Vercel

Slice D–F stay on this map as checkboxes. Dockerfile / `output: "standalone"` lands with the first Coolify deploy (B), not as extra rewrite work.

## Not yet specified

- Exact grace-period length after trial/paid lapse
- GST invoice layout
- Staging hostname (`staging.edubridge.app` vs Coolify preview only)
- Whether `www.edubridge.app` redirects to apex or is its own host

## Out of scope

- Customer custom domains (CNAME) — future ADR
- Per-school deployments
- Free plan tier (ruled out; trial then read-only)
- Merging Control Hub into entitlements
- Payments checkout in the rewrite PR
- Silent platform-owner membership in `school_members`
