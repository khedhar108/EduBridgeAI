# Supabase Auth Site URL and redirects

Type: `wayfinder:task` (HITL)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)

## Question

Are GoTrue Site URL and redirect allow-list set so register OTP / magic-link / forgot-password return to `edubridge.app` and `{slug}.edubridge.app` without breaking `localhost:3000`?

## Checklist (human, Supabase Dashboard → Authentication)

1. Site URL (Production): `https://edubridge.app`
2. Redirect URLs — keep all of:

   - `http://localhost:3000/auth/callback`
   - `https://edubridge.app/auth/callback`
   - Wildcard if the dashboard allows it: `https://*.edubridge.app/auth/callback`  
     If not, document the workaround (Coolify preview URLs are extra entries).

3. Do not remove localhost entries.
4. App env: `NEXT_PUBLIC_SITE_URL` matches the environment (local `http://localhost:3000`, prod `https://edubridge.app`).

## Blocked by

[Coolify on Hetzner](./task-coolify-hetzner.md) (need real production host `edubridge.app`).

## Close when

A test `/register` or `/forgot-password` email link opens the correct host. Record the exact redirect list on this ticket.
