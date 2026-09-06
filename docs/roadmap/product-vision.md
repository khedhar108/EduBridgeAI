# EduBridge — Product Vision

> Brainstorming output. Read once for context; the actionable plans live in the [phase files](./README.md#phases).

## Problem statement

Schools track student activity, report cards, and test creation across disconnected tools (paper registers, Excel, WhatsApp groups). Parents get information late or not at all. Teachers repeat manual work every term. Existing school ERPs are heavy, expensive, and hard to adopt.

**EduBridge** gives every school an isolated, modern workspace with focused modules that work together under one roof — starting small (a student dashboard) and growing module by module, with AI doing the repetitive work (summaries, report generation, sharing updates to parents over WhatsApp).

## Target users and rollout

| Stage | Who | How |
|-------|-----|-----|
| MVP | One pilot school | Manually onboarded; validates Student Dashboard |
| Growth | Nearby/partner schools | Direct onboarding + 15-day Max trial conversions |
| Scale | Any school | Self-service registration with official school email, subscription plans |

## Personas and capability matrix

| Capability | platform_owner | school_admin | accountant | teacher | staff | student | parent |
|---|---|---|---|---|---|---|---|
| Register school / manage workspace | — | ✅ | — | — | — | — | — |
| Add/manage members and roles | — | ✅ | — | — | — | — | — |
| Fee structures / scholarships / collections | — | ✅ | ✅ | — | — | — | — |
| Register students (direct) + pin fee version | — | ✅ | ✅ | — | — | — | — |
| Enter student activity/attendance | — | ✅ | — | ✅ | ✅ (delegated) | — | — |
| Enter marks | — | ✅ | — | ✅ | — | — | — |
| View student dashboard | — | ✅ (all) | — | ✅ (own classes) | ✅ (assigned) | ✅ (self) | ✅ (own children) |
| Request/share reports via WhatsApp | — | ✅ | — | ✅ | — | — | ✅ (receive) |
| Create report cards | — | ✅ | — | ✅ (draft) | — | — | — |
| Approve/publish report cards | — | ✅ | — | — | — | — | — |
| Create test papers / question banks | — | ✅ | — | ✅ | — | — | — |
| Build / publish timetable | — | ✅ | — | — | ✅ (designated) | — | — |
| View own timetable / post homework | — | ✅ | — | ✅ | — | — | — |
| Manage subscription / plans & module toggles | — | ✅ | — | — | — | — | — |
| Cross-school analytics (invites, conversions, revenue) | ✅ | — | — | — | — | — | — |

## Unified interface (the shell)

From the UI sketch, every workspace page shares a single header:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  [Application Menu ▾]  [● Active module pill]  [Search]  [Profile] │
└──────────────────────────────────────────────────────────────────┘
```

- **Application Menu** — role-filtered list of modules (Students, Teachers, Staff, ...). A parent never sees Test Paper Creator; a student only sees their dashboard.
- **Active module pill** — always shows which module you are in; clicking it returns to that module's home.
- **Search** — scoped to the active module first, then global within the workspace.
- **Profile** — account, role badge, school switcher (for users belonging to multiple schools, e.g. a parent with children in two schools), sign out.

The homepage under the header shows role-relevant module cards (Student Dashboard, Report Card Maker, Test Paper Creator, Timetable Maker, …). Modules are lazy-loaded feature folders — adding a module never touches existing ones.

## Module map

| Module | Phase | One-liner |
|--------|-------|-----------|
| Student Dashboard | 1 | Activity/attendance/marks tracked by teachers, staff, school; charts for parents/students |
| AI Assist (cross-module) | 2 | Mastra workflows: summaries, change detection, WhatsApp report delivery |
| Report Card Maker | 3 | Periodic tests / half-yearly / annual report cards with approval + PDF |
| Test Paper Creator | 4 | Teacher quiz/test creation from templates and question banks, AI-assisted |
| Timetable Maker | 5 | Clash-free period canvas (teacher double-book highlighted), Excel export, history, basic homework digest; AI later |
| Platform Owner Console | 6 | Cross-tenant: schools, subscriptions, per-school module toggles, revenue |
| Parent App | 6+ | Mobile-first PWA; parents + students via admission + DOB; multi-child wrapper; AI Q&A later |
| Fees (early ledger) | Early (pre–full Phase 1 dashboard) | Direct student registration, versioned fee plans, scholarships, manual collections, accountant role — see [features/fees](../features/fees/README.md) |
| Admissions | Later | Enquiry → application → admission details, roll/section allocation |
| Fees & Spending | Later | Expense tracking + analytics on top of the early ledger — "how much collected, how much spent" |
| Activities | Later | Events, achievements, gallery — feeds the dashboard and parent app |

Modules are individually toggleable per school by the platform owner (plan defaults + owner override), so a school can start with the dashboard and grow into admissions/fees on the same platform. This is how EduBridge covers "one platform that works in many ways" without becoming a monolithic ERP.

## Design principles

- **Premium modern UI is a feature.** The unified shell, charts, and mobile experience must look and feel a generation ahead of incumbent school software — it is the primary sales asset.
- **Light-only visual system.** One premium light theme (no product dark-mode toggle): institutional clarity for classrooms and parents, with AI-native surfaces (summaries, Copilot dock, voice) composed in-token — see [docs/design/MASTER.md](../design/MASTER.md).
- **Mobile-first, always.** Parents live on phones; every screen is designed phone-first and the parent app is a PWA (see [mobile-app.md](../architecture/mobile-app.md)).
- **Growth via product quality and direct onboarding — not referral incentives.** Schools will not share their playbook with competing schools, so there is no "refer 3 schools" mechanic; trials and a strong product convert.

## Tenancy model

1. A school's owner registers with the **official school email domain** (personal email domains are rejected for the admin account).
2. After email proof, EduBridge **immediately** provisions a **workspace**: a unique slug ending in `-bridge` (e.g. `dps-jaipur-bridge`). No sales queue. Abuse review can happen after they are in. Production URL is `dps-jaipur-bridge.edubridge.app` ([ADR-006](../decisions/ADR-006-workspace-subdomains.md)); local/dev uses path `/{slug}`. Platform console: `platform.edubridge.app`.
3. All data is stored in **one shared Supabase project** with a `school_id` on every tenant table and **Row Level Security** enforcing isolation (the "multi-tenant behavior from Supabase" approach — one database, policy-isolated tenants). This keeps operations simple and cheap at this scale; physical isolation per school is a future option, not a current requirement.
4. Users belong to schools through a `school_members` table (`user_id`, `school_id`, `role`), so one person can hold different roles in different schools. Platform owner access is a separate context (`platform_admins` + optional support grants) — never silent membership ([platform-boundaries.md](../architecture/platform-boundaries.md)).

## Business model (Phase 6)

**Three plans** — module sets are plan defaults; the platform owner can override per school via console toggles:

| Plan | Positioning | Module set (default) |
|------|-------------|----------------------|
| **Normal** | Entry — small schools, digitize the basics | Student Dashboard, WhatsApp report sharing |
| **Pro** | Standard — most schools | Normal + Report Card Maker, Test Paper Creator, Timetable Maker, AI summaries |
| **Max** | Premium — full platform incl. future modules | Pro + Admissions, Fees & Spending, Activities, priority AI limits |

- **Trial:** every newly registered school gets **15 days of Max free** — full-platform experience, then chooses a paid plan (trial expiry → grace → read-only; data never lost).
- **Billing periods:** upfront **3-month, 6-month, or annual** payment (annual incentivized, e.g. ~2 months free). Single plan per school at a time; per-service add-on pricing is a later enhancement.
- **No referral/coupon engine.** Deliberate decision: schools treat their processes as competitive advantage and won't recruit other schools. Growth comes from trials, direct onboarding, and product quality.
- **Platform owner console:** cross-tenant billing/aggregate module on `platform.edubridge.app` only: schools by plan/state, trial→paid funnel, **per-school module toggles**, revenue. Workspace content requires school-approved support grants ([support-access.md](../architecture/support-access.md)).

## AI strategy

- All AI runs through **Mastra** in `apps/agent` as **multi-step workflows** (not ad-hoc prompts in the web app): fetch tenant data → analyze → generate artifact → deliver.
- Long-term shape: an **orchestrator + domain sub-agents** ecosystem with scoped tools, per-user memory, and token-conservation discipline — see [agent-ecosystem.md](../architecture/agent-ecosystem.md).
- First workflows (Phase 2):
  - **Report summarization** — turn a student's raw dashboard data into a parent-friendly summary.
  - **Change detection + WhatsApp delivery** — when dashboard data changes and a share is requested from the dashboard, generate the report and send it to the parent's WhatsApp via a Business API provider.
- Later workflows: report card commentary (Phase 3), test paper generation from syllabus/question banks (Phase 4), timetable AI assist / homework WhatsApp (post–Phase 5 MVP), parent-app Q&A (post–Phase 6).
- Every workflow receives the tenant context (`school_id`, requesting role) and can only access that tenant's data.

## Non-goals (for now)

- Native mobile apps (responsive web first; WhatsApp is the mobile channel).
- Online payment gateways and full school accounting/expenses (early manual fee ledger is in scope).
- Physical database-per-tenant isolation.
- Marketplace of third-party modules.

## Open questions (resolve during the owning phase)

| Question | Owning phase |
|----------|--------------|
| Subdomain vs. path-based workspace URLs | **Decided** — [ADR-006](../decisions/ADR-006-workspace-subdomains.md) (prod subdomain; path in local; implement DNS in Phase 6) |
| WhatsApp provider (Meta Cloud API vs. Twilio vs. aggregator) | Phase 2 |
| Plan pricing amounts (per-student vs flat per plan) | Phase 6 |
| Grading schemes to support out of the box (CBSE/ICSE/state boards) | Phase 3 |
| Timetable AI instruction-block + marks/hours reshape | Post–Phase 5 MVP (same module) |
| iOS App Store vs. PWA-only for the parent app | Phase 6+ (Android Play Store via TWA is decided; see [mobile-app.md](../architecture/mobile-app.md)) |
