# Where the Mastra agent runs in production

Type: `wayfinder:grilling` (HITL)  
Status: **open**  
Map: [platform-launch.md](../platform-launch.md)

## Question

Where does `apps/agent` (Mastra, port 4111, LibSQL file `mastra.db` today) run once `edubridge.app` is live on Coolify — second Coolify service on the Hetzner VPS, separate host, or “AI module off until a later map”?

## Why this is HITL

File-backed LibSQL is a bad fit for ephemeral serverless. A human must accept cost and operational ownership. Until then, production should not point `MASTRA_API_URL` at a missing service.

## Close when

One of: (a) named host + storage choice, (b) explicit “AI entitlement stays off in prod until map X”. Generative AI module flag stays off until this closes.
