# Architecture Decision Records (ADRs)

Lightweight log of significant technical decisions.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./ADR-001-mastra-separate-app.md) | Mastra as separate `apps/agent` | Accepted |
| [ADR-002](./ADR-002-node-22.md) | Require Node.js >=22.13.0 | Accepted |
| [ADR-003](./ADR-003-submodule-removal.md) | Remove `apps/agent` submodule, track as normal files | Accepted |
| [ADR-004](./ADR-004-drizzle-data-access.md) | Drizzle ORM over Supabase Postgres (schema in `packages/db`, RLS in SQL) | Accepted |
| [ADR-005](./ADR-005-primary-app-edubridge.md) | Primary product app is `apps/edubridge`; `apps/web` is Mastra demo | Accepted |
| [ADR-006](./ADR-006-workspace-subdomains.md) | Production school subdomains; path fallback in local; `proxy.ts` host rewrite | Accepted |
| [ADR-007](./ADR-007-email-auth-password.md) | Email + password as the Phase 0 auth method | Accepted |
| [ADR-008](./ADR-008-delegated-admin-impersonation.md) | Delegated administration via coordinator + signed-cookie impersonation | Accepted |
| [ADR-010](./ADR-010-mastra-coolify-host.md) | Mastra OSS on Coolify, not Mastra Cloud | Accepted |

## ADR template

Create `ADR-NNN-short-title.md`:

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Superseded
**Date:** YYYY-MM-DD

## Context
What problem or choice prompted this?

## Decision
What we chose.

## Consequences
Pros, cons, follow-up work.

## References
Links to docs, external articles.
```
