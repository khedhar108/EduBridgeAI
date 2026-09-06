# Phase 6 — Platform Growth

> Turn EduBridge from a pilot product into a self-service SaaS: public school registration, automatic workspace provisioning, a 15-day Max trial, three paid plans with upfront billing, per-school module toggles, and the platform-owner console.

Tracker (open slices, do not skip): [platform-launch.md](../wayfinder/platform-launch.md).  
URL dual-mode: [workspace-urls.md](../architecture/workspace-urls.md).

## Status

### Done

- [x] 6.1 thin slice — public `/register`, OTP, `-bridge` slug, atomic school + first admin (no trial row yet)

### Left (do not start payments before rewrite)

- [ ] 6.6 Workspace URLs — wildcard DNS + TLS on Coolify/Hetzner (`proxy.ts` rewrite is in code); path fallback stays
- [ ] 6.2 Plans and trial engine — `normal | pro | max`, 15-day Max trial, read-only
- [ ] 6.3 Module entitlements — plan defaults + owner override; shell + write gate
- [ ] 6.4 Payments — provider ADR first ([research ticket](../wayfinder/tickets/research-payment-provider.md))
- [ ] 6.5 Platform owner console
- [ ] 6.7 Support access (JIT grants)

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

**Thin slice shipped (no billing):** public `/register` wizard (school name + India state/city → founder identity → workspace slug) → official-email OTP or magic link → atomic provision (`schools` + first `school_admin` `school_members` + profile). Instant — no sales approval. Founder forgot-password is `/forgot-password`. Staff `/join-school` is unchanged.

- [x] Public register flow: school name → official email (free-provider blocklist; domain stored on the school) → email verification → workspace name → slug `-bridge`, uniqueness enforced
- [x] Provisioning is one atomic server-side operation: `schools` row, admin `school_members` row
- [ ] `subscriptions` row (`trialing`, plan = `max`, 15 days) and default module entitlements — land with §6.2

### 6.2 Plans and trial engine

- [ ] `plans` table (code `normal | pro | max`, name, default module set, prices per period `3m | 6m | 12m`) — seeded, owner-editable in console
- [ ] `subscriptions` (school_id, plan, state, current_period_start/end) with a daily scheduled job transitioning states (`trialing → grace → read_only`; `active → grace → read_only` on lapse)
- [ ] Trial = subscription in `trialing` state with plan `max`; converting to paid swaps the plan and resets the period
- [ ] Read-only enforcement: shared guard blocks mutations for `read_only` workspaces (reads keep working); banners during `trialing`/`grace` — copy from [What read-only blocks](../wayfinder/tickets/grill-read-only-ux.md)

### 6.3 Module entitlement engine + owner toggles

- [ ] `module_entitlements` (school_id, module_id, enabled, source: `plan | owner_override`, updated_by, updated_at)
- [ ] Shell registry filtering + write gating (`assertModuleEntitled`)
- [ ] Owner console toggles — with §6.5
- Ids: [Canonical module ids](../wayfinder/tickets/grill-module-ids.md)

### 6.4 Payments

- [ ] Provider ADR ([Razorpay vs Stripe](../wayfinder/tickets/research-payment-provider.md)) then checkout for 3m/6m/12m upfront; webhook-driven `subscriptions` updates
- [ ] GST invoices for `school_admin`; renewal reminders
- No proration in v1 (locked)

### 6.5 Platform Owner Console

- [ ] `features/platform-console/` on `platform.edubridge.app` / `/platform` — `platform_admins` only, never a `school_members` row
- [ ] Security-definer aggregate views (billing/funnel only)
- Console has **no** general tenant-table browser (locked). Workspace content requires §6.7.

### 6.6 Workspace URL implementation

- [x] `proxy.ts` maps `<slug>.edubridge.app` / `{slug}.localhost` → `[workspace]` and `platform.*` → `/platform`
- [ ] Execute [ADR-006](../decisions/ADR-006-workspace-subdomains.md) DNS + TLS: Coolify on Hetzner, `*.edubridge.app`
- [x] Path-based URLs remain valid locally. Application code keeps using the workspace slug param
- [x] Reserved subdomains blocked from school slug allocation (`RESERVED_WORKSPACE_SLUGS`)

### 6.7 Support access (audited JIT)

- [ ] Implement [support-access.md](../architecture/support-access.md): `support_access_grants`, RLS helpers, banner, audit log, `features/support-access/`
- Default read-only; 4h default / 24h max (locked). Platform identity never inserted into `school_members` for support.

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

- [x] Registration wizard exists locally (`/register` → provision → `/{slug}`) — production host still path until 6.6
- [ ] Registration end-to-end on `edubridge.app` → land on `{slug}.edubridge.app` Max trial
- [ ] Free-provider emails rejected for registration
- [ ] Trial end → grace → read-only; writes blocked, reads work; payment restores access
- [ ] Plan change (Max trial → Normal paid) hides Pro/Max modules and blocks their writes
- [ ] Owner toggle disables a module for one school instantly; other schools unaffected
- [ ] Payment webhooks idempotent
- [ ] Owner console numbers reconcile; `school_admin` cannot reach console routes
- [ ] Support grant: enter with active grant; denied after expiry/revoke
- [x] Subdomain host rewrite lands in correct workspace; reserved names rejected (local `{slug}.localhost`)
- [ ] **Local path still works** after rewrite: `localhost:3000/{slug}/sign-in` and family cookie `Path=/{slug}/family`
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- First non-pilot school self-registers and activates without manual help
- First paid subscription processed end-to-end (any period)
- Owner toggles a module for a real school and the change is visible to that school immediately
- Owner console live with real funnel data
- Support access works end-to-end with audit trail on a real school
- Production school URLs use `<slug>.edubridge.app` per ADR-006
