# Phase 6 — Platform Growth

> Turn EduBridge from a pilot product into a self-service SaaS: public school registration, automatic workspace provisioning, a 15-day Max trial, three paid plans with upfront billing, per-school module toggles, and the platform-owner console.

## Goal

Any school can register with its official email, get its own `-bridge` workspace automatically, experience the full platform on a 15-day Max trial, then pick a paid plan (Normal / Pro / Max, billed upfront for 3 / 6 / 12 months). The platform owner controls which modules each school can access and tracks the funnel and revenue in a dedicated cross-tenant console.

## Final outcome (definition of done)

A school owner registers on the public site, verifies their official school email, names their workspace, and is inside their own trial workspace within minutes with no manual intervention. Trial expiry moves the school to read-only with a clear upgrade path; paying for a plan unlocks the plan's module set immediately. The `platform_owner` console shows every school's plan and state, and module toggles take effect on a school's next request.

## Scope

**In:**

- Public marketing/registration site (landing + register flow) — lives in `apps/edubridge` outside `[workspace]` routes (`features/registration/`, `(marketing)/`)
- School registration: official-email-domain validation (free providers blocked for the admin account), email verification, workspace slug creation (`<name>-bridge`), automated provisioning
- **Plan engine:** three tiers — `normal`, `pro`, `max` — each with a default module set; subscription states (`trialing | active | grace | read_only`)
- **Trial:** 15 days of **Max** (all current modules) on signup
- **Module entitlements:** per-school module access = plan defaults + owner override toggles; enforced server-side in the shell registry and on writes
- **Payments:** upfront billing for 3-month, 6-month, and annual periods (annual incentivized); invoices; provider decided by ADR (India-first suggests evaluating Razorpay vs. Stripe)
- **Enforcement:** `proxy.ts` / server gating by subscription state (read-only mode, grace period, banners) AND by module entitlement (disabled module → hidden from menu + writes blocked)
- **Platform Owner Console:** `features/platform-console/` on `platform.edubridge.app` — schools by plan/state, trial→paid funnel, per-school module toggles, revenue (collected, upcoming renewals), module adoption stats
- **Support access:** school-admin-approved, time-boxed, scoped grants ([support-access.md](../architecture/support-access.md)) — not silent owner membership
- **Workspace URLs:** implement [ADR-006](../decisions/ADR-006-workspace-subdomains.md) — production `<slug>.edubridge.app` via host rewrite; keep path fallback for non-prod

**Out (deferred):**

- Per-service add-on pricing (later enhancement on top of entitlements)
- Self-service data export / offboarding automation (manual on request initially)
- Multi-currency, resellers, invoicing beyond standard GST invoices
- Referral/coupon mechanics — **deliberately rejected** (schools won't recruit competitors; growth is trials + direct onboarding + product quality)
- Customer custom domains (CNAME) — future ADR

## Prerequisites

- Phase 0 exit criteria met (tenancy + auth are the hard dependency)
- Commercially sensible only after Phases 1–5 exist (there must be something worth paying for — dashboard through Timetable Maker)
- Payment provider account approved
- Architecture contracts reviewed: [platform-boundaries.md](../architecture/platform-boundaries.md), [ADR-006](../decisions/ADR-006-workspace-subdomains.md)

## Deliverables

1. `apps/edubridge/features/registration/`, `billing/`, `platform-console/`, `support-access/` — each following the [feature-folder blueprint](../guides/feature-folder-structure.md)
2. Migrations: plans, subscriptions, module entitlements, payments, `platform_admins`, `support_access_grants` (+ audit)
3. Provisioning service (registration → school + admin + trial, atomic)
4. `docs/decisions/` ADRs: payment provider (subdomains already locked in ADR-006)
5. `docs/features/platform-growth/` feature doc
6. Wildcard DNS + TLS; `proxy.ts` host → route rewrite

## Milestones

### 6.1 Registration and provisioning

- Public register flow: school name → official email (domain validated against a free-provider blocklist; domain stored on the school) → email verification → choose workspace name → slug generated with `-bridge` suffix, uniqueness enforced.
- Provisioning is one atomic server-side operation: `schools` row, admin `school_members` row, `subscriptions` row (`trialing`, plan = `max`, 15 days), default module entitlements materialized.

### 6.2 Plans and trial engine

- `plans` table (code `normal | pro | max`, name, default module set, prices per period `3m | 6m | 12m`) — seeded, owner-editable in console.
- `subscriptions` (school_id, plan, state, current_period_start/end) with a daily scheduled job transitioning states (`trialing → grace → read_only`; `active → grace → read_only` on lapse).
- Trial = subscription in `trialing` state with plan `max`; converting to paid swaps the plan and resets the period — module set changes take effect immediately (e.g. choosing Normal hides Pro/Max modules).
- Read-only enforcement: shared middleware blocks mutations for `read_only` workspaces (reads keep working — schools never lose access to their data); persistent banner with days remaining during `trialing`/`grace`.

### 6.3 Module entitlement engine + owner toggles

- `module_entitlements` (school_id, module_id, enabled, source: `plan | owner_override`, updated_by, updated_at). Plan changes rewrite `plan`-sourced rows; owner toggles write `owner_override` rows that survive plan changes until cleared.
- Enforcement is server-side, two layers:
  1. **Shell registry filtering:** module menu/cards rendered only for entitled modules (per role AND entitlement).
  2. **Write gating:** mutations for a disabled module return 403 even if the caller crafts a request.
- Owner console: per-school module toggle switches with instant effect (next request), plus "reset to plan defaults".

### 6.4 Payments

- Pricing page + checkout for 3m/6m/12m upfront (provider per ADR); webhook-driven `subscriptions` updates (`active`, renewals, failures → `grace`).
- Invoices (GST-compliant) accessible to `school_admin` in settings; renewal reminders via email/WhatsApp before period end.
- No proration in v1: plan changes apply at next renewal (upgrade can be immediate with a manual adjustment in console if the owner chooses).

### 6.5 Platform Owner Console

- Module visible **only** via platform context (`platform_admins`); never a `school_members` row.
- Hosted under `platform.edubridge.app` / `/platform` thin routes composing `features/platform-console/`.
- Cross-tenant reads go through dedicated SQL views/functions (`security definer`) that aggregate across schools — the only sanctioned **billing/aggregate** cross-tenant path.
- Dashboards: schools by plan and state (trialing/active/grace/read-only), registration→activation→paid funnel, revenue (collected, MRR-equivalent run-rate, upcoming renewals), module adoption (how many schools have each module on), per-school drill-down with module toggles.
- Console has **no** general tenant-table browser. Workspace content requires support grants (§6.7).

### 6.6 Workspace URL implementation

- Execute [ADR-006](../decisions/ADR-006-workspace-subdomains.md): wildcard DNS + TLS; `proxy.ts` maps `<slug>.edubridge.app` → `[workspace]` and `platform.edubridge.app` → `/platform`.
- Path-based URLs remain valid in local/non-prod. Application code keeps using the workspace slug param.
- Reserved subdomains (`www`, `platform`, `api`, …) blocked from school slug allocation.

### 6.7 Support access (audited JIT)

- Implement [support-access.md](../architecture/support-access.md): `support_access_grants`, RLS helpers, banner, audit log, `features/support-access/`.
- Default read-only; explicit write scopes; 4h default / 24h max; school admin or support may revoke.
- Platform identity never inserted into `school_members` for support.

## Data model touchpoints

New tables: `plans`, `subscriptions`, `module_entitlements`, `payments`/`invoices`,
`platform_admins`, `support_access_grants` (+ audit), plus owner-console views.
`schools` gains provisioning metadata as needed. Tenant product tables unchanged
except entitlement gating.

## RBAC notes

- Platform context: full console access to **aggregates/billing/toggles**; **cannot**
  browse school content without an active support grant
  ([platform-boundaries.md](../architecture/platform-boundaries.md)).
- `school_admin`: subscription, plan selection, invoices, **support grant** create/revoke for their school only.
- All other roles: see trial/read-only banners and entitled modules only — nothing else subscription-related.

## Standards

- Subscription state transitions only via the scheduled job and payment webhooks — never inline in request handlers.
- Module access always resolved server-side from `module_entitlements`; the plan table only supplies defaults.
- Payment webhooks idempotent (replayed webhook must not double-extend).
- Cross-tenant aggregation confined to owner-console views; any other cross-tenant query in review is an automatic reject.
- Support access fails closed; grants re-validated every request; no self-grant by platform.

## Testing checklist

- [ ] Registration end-to-end: verify email, provision workspace, land in Max trial (automated test)
- [ ] Free-provider emails rejected for registration
- [ ] Trial end → grace → read-only; writes blocked, reads work; payment restores access
- [ ] Plan change (Max trial → Normal paid) hides Pro/Max modules and blocks their writes
- [ ] Owner toggle disables a module for one school instantly; other schools unaffected; override survives plan change
- [ ] Payment webhooks idempotent
- [ ] Owner console numbers reconcile with raw tables; `school_admin` cannot reach console routes/views
- [ ] Support grant: enter with active grant; denied after expiry/revoke; write scopes honored; no `school_members` row for support user
- [ ] Subdomain host rewrite lands in correct workspace; reserved names rejected
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- First non-pilot school self-registers and activates without manual help
- First paid subscription processed end-to-end (any period)
- Owner toggles a module for a real school and the change is visible to that school immediately
- Owner console live with real funnel data
- Support access works end-to-end with audit trail on a real school
- Production school URLs use `<slug>.edubridge.app` per ADR-006
