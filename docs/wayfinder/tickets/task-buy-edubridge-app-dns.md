# Buy edubridge.app and point DNS at Hetzner

Type: `wayfinder:task` (HITL)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)

## Question

Does the human own `edubridge.app`, and do apex + wildcard `A` records point at the Coolify VPS (not Vercel nameservers)?

Production path is **Coolify + Hetzner**. Product domain stays `.app`, not `.com`.

## Checklist (human)

1. Register or confirm `edubridge.app` at the registrar (not `edubridge.com` unless that is only a redirect).
2. After the VPS exists ([Coolify + Hetzner](./task-coolify-hetzner.md)), create:
   - `A` record `@` → VPS IPv4
   - `A` record `*` → same IPv4
3. If using Hetzner DNS as the zone: set registrar nameservers to Hetzner’s, then add the same `A` / `*` records there (needed for Coolify’s Hetzner DNS-01 token).
4. Confirm `www` (redirect vs serve) — if unsure, leave a note on [Not yet specified](../platform-launch.md#not-yet-specified).

## Do not

- Delegate nameservers to Vercel unless you **switch** the whole host to Vercel
- Use the display school name as a DNS label
- Orange-cloud / Tunnel every tenant host through Cloudflare

## Blocked by

None for purchasing the domain. Wildcard `A` waits on the VPS IP from [task-coolify-hetzner.md](./task-coolify-hetzner.md).

## Close when

Apex and `*.edubridge.app` resolve to the VPS. Record registrar + zone (Hetzner DNS vs registrar DNS) on this ticket.
