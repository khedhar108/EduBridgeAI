# Support Access — Just-in-Time Workspace Entry

> How the platform owner (or named support identities) enters a school workspace
> without becoming a permanent member. Implements the industry pattern: school-
> approved, time-boxed, scoped, audited access — not silent impersonation.
>
> **Implementation phase:** Phase 6. This document locks the contract so Phase 0
> tenancy/RLS design does not paint us into silent-owner access.

Related: [platform-boundaries.md](./platform-boundaries.md),
[auth/rbac-model.md](./auth/rbac-model.md), [multi-tenancy.md](./multi-tenancy.md).

## Why this model (industry practice)

SaaS platforms (Stripe, Vercel, Linear-style support) typically:

1. Keep operator identity separate from customer membership.
2. Require customer (or explicit policy) approval for workspace entry.
3. Bound access by time and scope.
4. Show a visible “support mode” banner and write an audit trail.

EduBridge follows that pattern. The platform console shows **billing and
aggregates only**. Workspace content requires a grant. The owner acts as
**themselves**, never as a forged school user, and is **never** inserted into
`school_members` for support.

## Actors

| Actor | May |
|-------|-----|
| `school_admin` | Create, scope, expire, and revoke grants for their school |
| Platform support identity (`platform_admins`) | Request access (optional), enter while grant is live, revoke their session |
| Platform admin | **Cannot** self-grant; cannot expand scopes after approval |

## Grant lifecycle

```mermaid
sequenceDiagram
  participant SA as school_admin
  participant App as support-access feature
  participant DB as Postgres
  participant PO as platform_support
  SA->>App: createGrant(supportUser, reason, scopes, expiresAt)
  App->>DB: insert support_access_grants active
  PO->>App: enterWorkspace(schoolSlug)
  App->>DB: validate live grant for this user+school
  App-->>PO: support context + banner
  Note over PO,DB: RLS helpers allow scoped reads/writes
  SA->>App: revokeGrant
  App->>DB: status revoked; next request denied
```

### States

`pending` (optional request flow) → `active` → `expired` | `revoked` | `consumed`
(if single-entry tokens are used). Active grants are re-checked on every request.

### Duration

| Default | Maximum |
|---------|---------|
| 4 hours | 24 hours |

Either party can revoke immediately. Expiry is enforced in SQL helpers (compare
`expires_at` to `now()`), not only in UI.

## Scopes

Default: **read-only** for the modules listed on the grant.

Writes require explicit scopes, e.g.:

- `students.read` / `students.write`
- `report_cards.read` / `report_cards.write`
- Never a blanket `school_admin` equivalent.

Unknown scopes are rejected at grant creation. Expanding scopes requires a **new**
grant (or admin re-approval), not client-side mutation of an active row.

## Data model (Phase 6)

Conceptual table `support_access_grants` (names may refine at implement time):

| Column | Purpose |
|--------|---------|
| `id` | PK |
| `school_id` | Tenant |
| `support_user_id` | Platform identity (`auth.users` / profile) |
| `created_by` | School admin who approved |
| `reason` / `ticket_ref` | Human-readable why |
| `scopes` | Text[] or jsonb allow-list |
| `status` | `pending` \| `active` \| `expired` \| `revoked` |
| `starts_at` / `expires_at` | Window |
| `revoked_at` / `revoked_by` | Audit |
| timestamps | created/updated |

Indexes: `(school_id, support_user_id, status)`, `(expires_at)` for cleanup jobs.

### Audit events (append-only)

Record at least: grant created, entered workspace, sensitive area opened,
mutation attempted/succeeded, expired, revoked. Prefer a dedicated
`support_access_audit` table; never rely on application logs alone.

## RLS and app layering

1. **Identity:** `getUser()` — never `getSession()` alone for authz.
2. **Support context:** resolve live grant for `(userId, schoolId)` outside
   ordinary membership; attach scopes to request context.
3. **Guards:** `assertSupportScope(ctx, scope)` before mutations; read paths
   respect module allow-list.
4. **RLS:** private helpers such as `private.has_active_support_grant(school_id)`
   and scope checks. Tenant policies may OR in support read paths **only** via
   those helpers — never `platform_owner` bypass on all tables.
5. **No `school_members` insert** for the support user.

Platform aggregate views remain separate and must not be reused as a back door
into full tenant rows.

## UI requirements

- Persistent **Support mode** banner while grant is active (school name, expiry,
  revoke control for both sides where applicable).
- School admin: grants list under workspace settings (who, scopes, time left).
- Platform console: “Request / enter support” only when a grant exists (or
  after school approval of a request).

## Abuse cases (must fail closed)

| Attempt | Expected result |
|---------|-----------------|
| Enter workspace with no grant | 404/403; no data |
| Use expired or revoked grant | Denied on next request |
| Client sends extra scopes | Ignored; server uses DB grant only |
| Platform user joins as `school_admin` via support flow | Forbidden |
| Reuse grant after revoke | Denied |
| Read another school with a grant for school A | Denied |

## Feature folder

Implementation lives in `apps/edubridge/features/support-access/` with thin
routes under workspace settings and platform console. Public surface only via
`index.ts`. See [platform-boundaries.md](./platform-boundaries.md).

## Out of Phase 0

Phase 0 establishes tenancy so support can be added later without rewriting RLS
philosophy. Do **not** ship support grants, banners, or owner-in-workspace UX in
Phase 0. Do reserve: no silent owner membership, and document this contract.
