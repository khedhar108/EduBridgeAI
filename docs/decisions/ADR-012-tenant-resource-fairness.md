# ADR-012: Shared-everything tenancy; fairness is staged

**Status:** Accepted  
**Date:** 2026-09-06

## Context

EduBridge is a multi-tenant school SaaS on one Supabase Postgres project.
Industry playbooks split two problems that look similar:

1. **Isolation** — School A must not read School B.
2. **Fairness** — School A must not starve School B of pool connections, CPU, or query time.

ADR-004 already chose isolation: shared database + RLS, not per-school databases
or schemas. This record covers fairness (noisy neighbor), and how far we go
against [Supabase Postgres best practices](../../.agents/skills/supabase-postgres-best-practices/SKILL.md)
without building Redis, extra poolers, or a second database.

We isolate **data**. We do not yet cap **CPU or connections** per school.

## Decision

Stay on **shared-everything** tenancy. Stage fairness; do not build it now.

**Stay on**

- One Postgres. Tenant rows carry `school_id`. Physical DBs / schemas per school
  are not Phase 0 (see [multi-tenancy.md](../architecture/multi-tenancy.md)).
- RLS `ENABLE` + `FORCE` on every tenant table. Policies wrap helpers in
  `(SELECT …)`. Private `SECURITY DEFINER` helpers check `auth.uid()` inside.
- Tenant from the session, never from client `school_id`.
- App `DATABASE_URL` is the transaction pooler (`:6543`) with `prepare: false`.
- Indexed `school_id` and foreign keys. Client cache keys include `schoolId`
  ([ADR-011](./ADR-011-tanstack-query-client-cache.md)).

**Do not build now**

Redis, per-school databases or schemas, Kubernetes fair-share, per-tenant
PgBouncer pools, a global server-action rate limiter, CDN of tenant JSON,
table partitioning, JSONB GIN, full-text search, covering/partial indexes,
`SKIP LOCKED` / advisory locks, in-app `VACUUM` / `pg_stat_statements`
wrappers.

**Named leftovers (triggers, not a build)**

| Trigger | Then |
|---------|------|
| Auth abuse | Persist rate limit on staff sign-in + family proof; return 429, not a fake “details don’t match.” Family limiter today is in-process only (`match-student-for-family.ts`). |
| One school saturates the pooler | `SET LOCAL statement_timeout` in `withTenant`; explicit postgres.js `max`; then a per-`school_id` action budget. |
| Directory `OFFSET` hurts | Keyset pagination (`full_name, id`) on the student directory. Fine while lists are hundreds of rows. |
| LLM bills spike | Phase 2 per-school workflow cap ([agent-auth.md](../architecture/auth/agent-auth.md)). |
| VPS CPU pegged by many schools | Second Coolify replica behind Traefik. Still one shared pooler. |
| A whale school needs isolation | Dedicated DB/schema as a later commercial SKU, not Phase 0. |

Load balancing stays reverse-proxy in front of one app ([ADR-009](./ADR-009-staging-production-topology.md)).
Scaling is a bigger VPS or more identical replicas, not per-school balancers.

Caching stays the TanStack Query browser cache. Do not globally cache tenant
rows. Confirm Supabase dashboard idle-in-transaction timeout; set postgres.js
`idle_timeout` only if the dashboard is unset. Use the hosted query-performance
dashboard when something is slow.

### Postgres audit (keep / leftover / skip)

**Keep:** RLS basics + performance wrappers; `anon` revoked; `:6543` +
`prepare: false`; `school_id` and FK indexes; composite indexes where the query
is composite; snake_case identifiers; CHECKs in schema TS; `timestamptz` /
enums / integer INR (not float); joins inside `withTenant`; short transactions
with no HTTP inside the tx.

**Leftover:** `statement_timeout`, explicit pool `max`, idle timeout, keyset
pagination, dashboard-only `pg_stat_statements`. See triggers above.

**Skip until a real query or table size forces it:** partitioning, UUIDv7 PK
migration, JSONB GIN (blobs are stored/read, not queried with `@>`), covering
and partial indexes, FTS, queue locks, autovacuum from app code.

Accepted deviations: UUID v4 PKs; integer INR rupees instead of
`numeric(10,2)`; `varchar` + CHECK for names instead of unbounded `text`.

## Consequences

**Pros**

- Isolation is already the backstop; fairness work has named triggers instead
  of speculative infra.
- One pooler and one Next process stay cheap to operate at pilot scale.
- Future readers will not assume Redis, per-tenant rate limits, or
  `statement_timeout` exist.

**Cons**

- A busy school can still use more pool slots and query time than a quiet one.
- Family rate limit does not survive process restart or a second replica.
- Staff sign-in has no app-level rate limit (Supabase only).

**Follow-up**

Ship leftover rows only when their trigger fires. Do not fold them into this
decision as code.

## References

- [ADR-004](./ADR-004-drizzle-data-access.md) — Drizzle + RLS isolation
- [ADR-009](./ADR-009-staging-production-topology.md) — Vercel staging, Coolify production
- [ADR-011](./ADR-011-tanstack-query-client-cache.md) — tenant-keyed client cache
- [multi-tenancy.md](../architecture/multi-tenancy.md)
- [data-access.md](../architecture/data-access.md)
- [database-workflow.md](../guides/database-workflow.md)
- [agent-auth.md](../architecture/auth/agent-auth.md)
- [Supabase Postgres best practices](../../.agents/skills/supabase-postgres-best-practices/SKILL.md)
