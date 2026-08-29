# Authentication and Authorization

> Everything about identity in EduBridge: which methods we support, how roles are separated, how the `features/auth/` module implements it, how `apps/agent` trusts requests, and the security checklist. Start here, then open only the file matching your task.

## Files

| File | Read this when... |
|------|-------------------|
| [strategy.md](./strategy.md) | You need the big picture: why Supabase Auth, the method matrix (password/OTP/passkeys), cost and scaling path |
| [rbac-model.md](./rbac-model.md) | You touch roles, permissions, platform-owner vs. school roles, or membership |
| [admin-controls.md](./admin-controls.md) | You touch the coordinator role, member activation/deactivation, admin login-as (impersonation), or username sign-in |
| [Control Hub map](../../wayfinder/control-hub.md) | Admin permission toggles grouped by module; do not add a parallel ACL |
| [family-access.md](./family-access.md) | Parent/student admission number + DOB (read-only family session; not staff login) |
| [family-surface.md](./family-surface.md) | Family (one child) vs school (`/students`, class filter) routes |
| [Workspace URLs](../workspace-urls.md) | Path vs `{slug}.edubridge.app`; family cookie dual-mode; do not deploy family on path-only prod |
| [feature-module.md](./feature-module.md) | You implement or modify `apps/edubridge/features/auth/` (screens, actions, flows) |
| [agent-auth.md](./agent-auth.md) | You work on `apps/edubridge` ↔ `apps/agent` communication or Mastra server auth |
| [best-practices.md](./best-practices.md) | You review security, prepare for launch, or audit an auth change |

## The one-paragraph model

Users authenticate for **staff** with **Supabase Auth** (email/password, email OTP, phone OTP, passkeys). **Parents and students** use a separate **family proof** (admission number + DOB) — see [family-access.md](./family-access.md). Staff authorization is **ours** across three contexts: tenant (`school_members`), platform (`platform_admins`), and temporary support grants (Phase 6). Every staff tenant request resolves `{ userId, schoolId, role }` server-side via `getSessionContext()`, gates via `assertCapability()` (defaults in `lib/auth/capabilities.ts`; [Control Hub](../../wayfinder/control-hub.md) later), and queries via `withTenant()` so Postgres RLS is the final backstop. Boundaries: [platform-boundaries.md](../platform-boundaries.md). The AI service (`apps/agent`) never sees user sessions — `apps/edubridge` mints short-lived HMAC-signed service tokens carrying the validated tenant context, verified by Mastra's JWT auth provider.

## Two doors (school is the URL)

The school is never typed on a workspace host. Local: `localhost:3000/<slug>/…` (or `{slug}.localhost:3000`). Production (after DNS): `{slug}.edubridge.app`. Rewrite is in `proxy.ts`; wildcard DNS is HITL ([workspace-urls](../workspace-urls.md)).

| Surface | Local URL | Production URL (after rewrite) | Who | Session |
|---------|-----------|--------------------------------|-----|---------|
| Public door | `/{slug}/sign-in` | `{slug}.edubridge.app/sign-in` | Anyone | How are you? |
| Staff | `/{slug}/sign-in?who=school` | same host `?who=school` | Admin, teacher, staff, accountant, coordinator | Supabase Auth |
| Staff (bookmark) | `/sign-in` | `edubridge.app/sign-in` | Same | Staff-only — no family form |
| Register school | `/register` | `edubridge.app/register` | Founder | Creates `schools` + first `school_admin` |
| Family proof | `/{slug}/sign-in?who=family` | `{slug}.edubridge.app/sign-in?who=family` | Parent or student | HMAC cookie `edubridge.family` |
| Family app | `/{slug}/family/*` | `{slug}.edubridge.app/family/*` | Parent or student | Same cookie — **no** `auth.users` |

- Family cookie cannot open Team or Fees. Staff session cannot be created from admission + DOB, and cannot open the family hub.
- Anonymous family entry redirects to the chooser with `?who=family`. Cookie present → `/family/home` (path-prefixed locally).
- Global `/sign-in` (no slug) stays staff-only — family proof needs the workspace slug.
- Staff accounts are created by **registering a school**, in the office (Add member), or via domain join. Family never uses staff passwords. The student row is the family login.
- There is no separate “admin login.” School admin is staff (chooser → School).

Detail: [family-access.md](./family-access.md) · [family-surface.md](./family-surface.md) · [feature-module.md](./feature-module.md) · [workspace-urls.md](../workspace-urls.md).

## Reading order for AI agents

1. This file.
2. [rbac-model.md](./rbac-model.md) if the task involves any permission check (most do); [platform-boundaries.md](../platform-boundaries.md) for SaaS isolation; [family-access.md](./family-access.md) for parent/student entry.
3. Then exactly one of: [feature-module.md](./feature-module.md) (web auth UI/flows) or [agent-auth.md](./agent-auth.md) (AI service).
4. [best-practices.md](./best-practices.md) before shipping auth changes to production.

Related: [../data-access.md](../data-access.md) (session context + RLS mechanics), [../../roadmap/phase-0-foundation.md](../../roadmap/phase-0-foundation.md) (implementation milestones).
