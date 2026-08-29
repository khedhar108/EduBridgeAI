# AGENTS.md — EduBridge

Portable rules for AI coding agents (Cursor, Claude Code, Codex, Copilot, etc.). **Cursor users:** `.cursor/rules/*.mdc` mirrors these rules and auto-loads — this file is the human-edited source of truth; keep the two in sync when editing.

## What this repo is

**EduBridge** — a multi-tenant school platform. Turborepo monorepo (pnpm), Next.js 16, Supabase (Auth + Postgres + RLS), Drizzle ORM, Mastra for AI workflows. Built phase-wise; see `docs/roadmap/README.md` for the active phase.

## Hard rules

1. **pnpm only** (npm/yarn blocked), Node `>=22.13.0`, commands from repo root.
2. **Active phase only.** Implement only what the active phase file in `docs/roadmap/` scopes. Never pull in future-phase work unless the user asks.
3. **Multi-tenancy is sacred.** Every tenant table has `school_id` + RLS (policies in SQL migrations). Tenant context comes from the session, never from client input. Cross-tenant reads only via platform-owner views.
4. **Drizzle owns table access.** No raw SQL in app code; Supabase client only for auth/storage/realtime. Every action: resolve session → `assertCapability` (capability map in `lib/auth/capabilities.ts`; do not add parallel role arrays) → `withTenant(...)` → query. RLS is the backstop, not the UX. Control Hub: `.cursor/rules/70-permissions.mdc`, [control-hub.md](docs/wayfinder/control-hub.md).
5. **Feature folders.** Module code in `apps/edubridge/features/<module>/` per `docs/guides/feature-folder-structure.md`; routes stay thin; other code imports only the module's `index.ts`; navigation only via the shell module registry.
6. **AI lives in `apps/agent`** (Mastra). The product app (`apps/edubridge`) uses the typed client with scope-claimed service tokens; no LLM calls in the Next app. Agents **never write tenant data directly** — they draft, humans approve, writes go through server actions. Memory is resource-scoped per user. Details: `docs/architecture/agent-ecosystem.md`.
7. **Shared packages are domain-free.** `packages/ui`, `packages/ai-ui` hold primitives only; ShadCN components added via `pnpm ui:add`. `packages/db` holds schema + Drizzle client only (no UI).
8. **Docs move with code.** If your change contradicts a doc in `docs/`, update that doc in the same change.
9. **UI is light-only premium.** Visual system lives in `docs/design/MASTER.md` — no product dark-mode toggle; semantic tokens only; Aceternity for marketing only; AI surfaces via `@repo/ai-ui` + CopilotKit slots. Cursor mirror: `.cursor/rules/40-ui-design.mdc`.
10. **Primary app:** `apps/edubridge` (port 3000). `apps/web` is Mastra starter/demo (port 3002) — see ADR-005.
11. **Git:** Conventional Commits (terse); branches `feature/*` → `development` (staging) → `main` (production). Never push features straight to `main`. Full guide: `docs/guides/git-and-release-strategy.md`. Cursor mirror: `.cursor/rules/50-git-workflow.mdc`. Skill: `.agents/skills/edubridge-git/`.
12. **Build log:** After milestones, append `docs/build-log/NNNN-*.md` and update its index (`docs/build-log/README.md`).
13. **Database migrations:** Edit only `packages/db/src/schema/*.ts`, then `pnpm db:generate -- --name=<short-kebab-name>`. Never create `migrations/*.sql` or `meta/` snapshots by hand. After generate, **append only** RLS/grants/helper SQL — never hand-write `CREATE TABLE` / `ALTER TABLE` / `CREATE INDEX`. A missed index is a new generated file, not a paste into the last one. Always ask before `pnpm db:migrate`. `pnpm db:check` is the read-only health check. Cursor: `.cursor/rules/10-database.mdc`.
14. **Third-party component code is vendored, never depended on.** Components from open-source registries (threeui, 21st.dev, Aceternity, canvas-ui, …) are copied in via the shadcn CLI (`pnpm registry:add`, lands in `apps/edubridge/components/registry/`) and must pass the audit gate first — no runtime npm deps on niche animation libraries (approved: `framer-motion`/`motion`/`three`). Gate + inventory: `docs/guides/third-party-components.md`. Cursor mirror: `.cursor/rules/40-ui-design.mdc`. Skill: `.agents/skills/registry-components/`.

## Where to look (reading order)

1. This file → rules.
2. `docs/roadmap/README.md` → active phase + cross-phase standards.
3. Active phase file → scope.
4. Task doc (one only, matching the task): `docs/architecture/data-access.md` (DB/tenancy), `docs/architecture/auth/` (sign-in/roles), `docs/architecture/workspace-urls.md` (path vs `{slug}.edubridge.app`; [platform-launch](docs/wayfinder/platform-launch.md) checkboxes), `docs/wayfinder/control-hub.md` (Control Hub / permission toggles), `docs/architecture/agent-ecosystem.md` (AI agents/memory), `docs/architecture/mobile-app.md` (PWA/parent app), `docs/guides/feature-folder-structure.md` (modules), `docs/design/MASTER.md` (UI/visual system), `docs/guides/third-party-components.md` (registry/vendored components), `TAILWIND_SHADCN_GUIDE.md` (Tailwind/ShadCN CSS architecture). Brand constants: `.cursor/rules/61-brand-constants.mdc` (`apps/edubridge/lib/brand.ts` only). Brand/legal copy: `.cursor/rules/60-legal-brand.mdc` plus `apps/edubridge/lib/legal/`. Permissions: `.cursor/rules/70-permissions.mdc`.
5. `docs/agents/README.md` → extended guidance, key facts, context strategy.

## Skills

Deep, task-specific knowledge lives in `.agents/skills/` (mastra, shadcn, registry-components, supabase-postgres-best-practices, ui-ux-pro-max, edubridge-git, caveman-commit, erp-landscape — competitor/market strategy reference for Fedena, Entab, PowerSchool, MyClassCampus + India school ERP context, etc.) — load the matching skill when the task touches that domain instead of guessing. Brand constants: `.cursor/rules/61-brand-constants.mdc`. Brand/legal copy: `.cursor/rules/60-legal-brand.mdc`.

## Verification

Before finishing any code change: `pnpm lint`, `pnpm check-types`, and `pnpm build` (from root) must pass. DB changes additionally require: RLS policies written + cross-tenant isolation tested (two schools).
