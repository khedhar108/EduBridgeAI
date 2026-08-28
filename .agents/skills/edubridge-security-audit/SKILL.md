---
name: edubridge-security-audit
description: >
  Security and multi-tenancy vulnerability audit for EduBridge. Checks RLS policy
  coverage, tenant isolation, session/role assertion in server actions, secrets
  hygiene, and agent write boundaries. Use when the user asks to audit security,
  check vulnerabilities, review RLS, verify tenant isolation, review a migration
  before merge, or says words like "security check", "vulnerability scan",
  "is this safe", "audit this feature/module/PR".
---

# EduBridge Security Audit

Systematic vulnerability review. Canonical context: `AGENTS.md` hard rules 3–6,
`docs/architecture/data-access.md` (DB/tenancy), `docs/architecture/auth/` (roles),
`docs/architecture/agent-ecosystem.md` (AI boundaries). Load the
`supabase-postgres-best-practices` skill for deep Postgres/RLS review.

## Audit order

Run checks top to bottom. For each, record PASS / FAIL / N/A with file:line evidence.
Never fix during an audit — report first, fix only when the user asks.

## 1. Tenant isolation (highest priority)

- Every table with tenant data has `school_id` (schema in `packages/db/src/schema/*.ts`).
- Every tenant table has RLS **enabled** and at least one policy in generated migration SQL.
- Policies bind `school_id` to the session claim (e.g. `auth.jwt() -> 'school_id'`), never to a
  client-supplied parameter.
- No `SECURITY DEFINER` function that bypasses tenant filters without an explicit school filter inside.
- Cross-tenant reads exist only via platform-owner views/policies.

## 2. Server actions & data access

- Every action: resolve session → assert role → `withTenant(...)` → query (rule 4).
  Grep server actions for queries that skip `withTenant` or trust request body IDs for scope.
- No raw SQL in app code; Supabase client used only for auth/storage/realtime.
- Tenant context comes from the session only — flag any `schoolId` read from cookies,
  params, or form input without server-side revalidation.

## 3. RLS runtime test (not just policy review)

Policies on paper can lie. If DB access is available:

```
pnpm db:check
node packages/db/scripts/run-rls-test.mjs
```

The two-school test (users from school A cannot read/write school B rows) must pass
for every new table before an audit can PASS section 1.

## 4. Auth & roles

- Sign-in flows match `docs/architecture/auth/` and current ADRs.
- Role checks happen server-side; nav/menu hiding is cosmetic, not the control.
- No route/page renders tenant data without a session + role assertion at the server boundary.

## 5. Agent boundaries (rule 6)

- No LLM calls inside `apps/edubridge` — AI goes through the typed client to `apps/agent`.
- Agents never write tenant data directly: drafts + human approval + server-action writes.
- Service tokens are scope-claimed and validated; memory is resource-scoped per user.
- Flag any agent tool that opens a DB handle with a privileged role.

## 6. Secrets & config

- No secrets in code, logs, or client bundles (`NEXT_PUBLIC_*` must not leak keys).
- `.env*` files are ignored; `varlock` skill governs secret handling.
- Service-role keys appear only in trusted server contexts, never in edge/middleware
  paths reachable with a forged token.

## 7. Input & output surfaces

- Server actions validate input (zod or equivalent) before DB writes.
- User content rendered in AI surfaces (`@repo/ai-ui`) is treated as untrusted text.
- No `dangerouslySetInnerHTML` with user/AI-generated content without sanitization.

## Report format

End with a table: check | status | evidence (file:line) | severity (critical/high/medium/low).
Critical = tenant data crossable or privilege escalation. Then a short prioritized fix list.
Security-relevant fixes get their own commit/PR — never mixed with feature work.
