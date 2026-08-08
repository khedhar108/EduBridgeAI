# Authentication and Authorization

> Everything about identity in EduBridge: which methods we support, how roles are separated, how the `features/auth/` module implements it, how `apps/agent` trusts requests, and the security checklist. Start here, then open only the file matching your task.

## Files

| File | Read this when... |
|------|-------------------|
| [strategy.md](./strategy.md) | You need the big picture: why Supabase Auth, the method matrix (password/OTP/passkeys), cost and scaling path |
| [rbac-model.md](./rbac-model.md) | You touch roles, permissions, platform-owner vs. school roles, or membership |
| [family-access.md](./family-access.md) | Parent/student admission number + DOB (read-only family session; not staff login) |
| [feature-module.md](./feature-module.md) | You implement or modify `apps/edubridge/features/auth/` (screens, actions, flows) |
| [agent-auth.md](./agent-auth.md) | You work on `apps/edubridge` ↔ `apps/agent` communication or Mastra server auth |
| [best-practices.md](./best-practices.md) | You review security, prepare for launch, or audit an auth change |

## The one-paragraph model

Users authenticate for **staff** with **Supabase Auth** (email/password, email OTP, phone OTP, passkeys). **Parents and students** use a separate **family proof** (admission number + DOB) — see [family-access.md](./family-access.md). Staff authorization is **ours** across three contexts: tenant (`school_members`), platform (`platform_admins`), and temporary support grants (Phase 6). Every staff tenant request resolves `{ userId, schoolId, role }` server-side via `getSessionContext()`, role-gates via `assertRole()`, and queries via `withTenant()` so Postgres RLS is the final backstop. Boundaries: [platform-boundaries.md](../platform-boundaries.md). The AI service (`apps/agent`) never sees user sessions — `apps/edubridge` mints short-lived HMAC-signed service tokens carrying the validated tenant context, verified by Mastra's JWT auth provider.

## Reading order for AI agents

1. This file.
2. [rbac-model.md](./rbac-model.md) if the task involves any permission check (most do); [platform-boundaries.md](../platform-boundaries.md) for SaaS isolation; [family-access.md](./family-access.md) for parent/student entry.
3. Then exactly one of: [feature-module.md](./feature-module.md) (web auth UI/flows) or [agent-auth.md](./agent-auth.md) (AI service).
4. [best-practices.md](./best-practices.md) before shipping auth changes to production.

Related: [../data-access.md](../data-access.md) (session context + RLS mechanics), [../../roadmap/phase-0-foundation.md](../../roadmap/phase-0-foundation.md) (implementation milestones).
