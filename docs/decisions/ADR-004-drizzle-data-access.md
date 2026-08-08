# ADR-004: Drizzle ORM over Supabase Postgres

**Status:** Accepted
**Date:** 2026-08-05

## Context

EduBridge needs a data-access layer for a multi-tenant SaaS on Supabase Postgres. Requirements: type safety from schema to app code, no raw SQL strings scattered through components/actions, RLS enforced per tenant on every query, shared schema between `apps/web` and `apps/agent`, and no hard lock-in to Supabase hosting.

Candidate approaches:

1. **Supabase JS client everywhere (no ORM)** — perfect RLS integration via the user's JWT, but table access becomes stringly-typed filters with types that drift from the schema; two query styles (auth/storage vs. CRUD); weakest refactor safety.
2. **Prisma** — mature ORM, but its engine connects as a single role; impersonating tenants for RLS requires middleware/extensions that are fragile with Next.js SSR auth, and it adds a heavy runtime plus a second schema language.
3. **Drizzle ORM** — thin TypeScript SQL layer: schema-as-code, generated types, and transaction-scoped `set_config` support so Postgres RLS applies natively per request.

## Decision

Use **Drizzle ORM** (schema + migrations in a new `packages/db` workspace package, `drizzle-kit` for migrations) as the single table-access layer in all server code. Use **Supabase Auth** (`@supabase/ssr`) for authentication, and keep **RLS policies in SQL migrations** as the isolation backstop. Supabase client is reserved for auth flows, storage, and realtime — never for table CRUD.

Tenant context is injected per transaction via `withTenant(claims, tx => ...)` using transaction-scoped `set_config('request.jwt.claims', ...)`. Server actions validate input (zod), assert the role, then run Drizzle queries inside that transaction.

Full working patterns: [docs/architecture/data-access.md](../architecture/data-access.md).

## Consequences

**Pros**

- One type-safe query style; schema drift fails at `pnpm check-types`, not in production
- RLS applies per transaction without ORM-specific hacks — policies stay plain Postgres SQL
- Schema shared between `apps/web` and `apps/agent` via `packages/db`
- Portable: moving Postgres hosts is a connection-string change; Supabase-specific surface confined to auth/storage/realtime edges

**Cons**

- Tenant context must be set explicitly per transaction — mitigated by making `withTenant` the only sanctioned query path (enforced by rules + review)
- Membership bootstrap query (session → school/role resolution) runs outside RLS tenant claims by design; must be kept minimal and reviewed
- `drizzle-kit` migrations + RLS SQL in the same repo means two artifacts per table change (schema + policy) — accepted as the cost of explicit policies

**Follow-up**

- Phase 0: create `packages/db`, `lib/db` wiring, `getSessionContext()`, RLS helper functions, two-school isolation tests.

## References

- [docs/architecture/data-access.md](../architecture/data-access.md)
- [docs/roadmap/phase-0-foundation.md](../roadmap/phase-0-foundation.md)
- [Drizzle ORM docs](https://orm.drizzle.team/)
- [Supabase RLS docs](https://supabase.com/docs/guides/auth/row-level-security)
