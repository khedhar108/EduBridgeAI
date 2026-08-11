# AI Agent Guide

Extended guidance for coding agents (Cursor, Claude Code, Copilot, etc.). The **rules** live in `AGENTS.md` (root) and `.cursor/rules/*.mdc` — this file is the context strategy and the "where is what" reference.

## How context is managed in this repo

Markdown files alone are not enough — the risk is agents either missing rules or loading too much. EduBridge uses three layers:

| Layer | Location | Loaded when | Size budget |
|-------|----------|-------------|-------------|
| **Rules (auto)** | `.cursor/rules/*.mdc`, `AGENTS.md` | Always, by the tool | ~250 lines total — keep it lean |
| **Routing docs** | Root `README.md` documentation map, this file | Start of session | Skim tables only, follow links on demand |
| **Task docs** | `docs/roadmap/`, `docs/architecture/`, `docs/guides/`, feature READMEs, `.agents/skills/` | Only when the task matches | One doc at a time, never bulk-read |

Rules for agents:

- **Do not read every doc.** Follow the reading order in `AGENTS.md`; stop when you have enough context.
- **One phase at a time.** Only the active phase file from `docs/roadmap/` is in scope.
- **Feature READMEs are the module bundle.** Before working inside `apps/web/features/<module>/`, read its 15–30 line README — that is the intended context unit.
- **Skills for deep domains.** Load the matching `.agents/skills/<name>` skill (mastra, shadcn, supabase-postgres-best-practices, ...) when the task touches that domain, instead of guessing APIs.
- **Writing docs?** Follow `.cursor/rules/40-documentation.mdc` — where docs live, when to write them, format, and index updates.

## EduBridge-local skills (slash attach in Cursor)

| Skill | Slash name | Load when |
|-------|------------|-----------|
| [edubridge-shell](../../.agents/skills/edubridge-shell/SKILL.md) | `edubridge-shell` | Workspace shell, `features/shell`, `modules.ts`, `[workspace]/layout` |
| [dotmatrix](../../.agents/skills/dotmatrix/SKILL.md) | `dotmatrix` | Dotmatrix loaders, `AppLoader`, async Suspense fallbacks |
| [canvas-ui](../../.agents/skills/canvas-ui/SKILL.md) | `canvas-ui` | Canvas UI on marketing `/` only |
| [edubridge-git](../../.agents/skills/edubridge-git/SKILL.md) | `edubridge-git` | Commits, branches, PRs to `development` / `main` |

Also in repo: shadcn, mastra, aceternity-ui, ui-ux-pro-max, ponytail, caveman-commit, etc. under `.agents/skills/`.

## Load order

1. `AGENTS.md` (root) — hard rules
2. [docs/roadmap/README.md](../roadmap/README.md) — active phase + cross-phase standards
3. The **active phase file** — implementation scope
4. Task-specific, one only:
   - DB/auth/tenancy → [architecture/data-access.md](../architecture/data-access.md)
   - New/changed module → [guides/feature-folder-structure.md](../guides/feature-folder-structure.md)
   - UI / visual system → [design/MASTER.md](../design/MASTER.md) (+ [component-policy.md](../design/component-policy.md) / [ai-surfaces.md](../design/ai-surfaces.md) as needed)
   - Styling setup (Tailwind two-compilation) → [TAILWIND_SHADCN_GUIDE.md](../../TAILWIND_SHADCN_GUIDE.md)
   - Mastra/AI → [architecture/ai-platform.md](../architecture/ai-platform.md) + `.agents/skills/mastra`
   - Agent architecture/memory → [architecture/agent-ecosystem.md](../architecture/agent-ecosystem.md)
   - Parent app/PWA/store → [architecture/mobile-app.md](../architecture/mobile-app.md)

## Key facts (avoid guessing)

| Topic | Value |
|-------|-------|
| Package manager | pnpm only (`only-allow` enforced) |
| Node version | >=22.13.0 (`.nvmrc`) |
| Main frontend | `apps/web` (port 3000) |
| Mastra service | `apps/agent` as `@repo/agent` (port 4111) |
| Shared UI | `packages/ui` (`@repo/ui`), AI primitives in `packages/ai-ui` |
| Visual system | Light-only — `docs/design/MASTER.md` (no product dark-mode toggle) |
| DB layer | Drizzle ORM, schema in `packages/db` (Phase 0), RLS in SQL migrations |
| Auth | Supabase Auth (SSR), roles in `school_members` |
| Roles | `platform_owner`, `school_admin`, `accountant`, `teacher`, `staff`, `student`, `parent` |
| LLM provider switch | `LLM_PROVIDER` env in `apps/agent/.env` |
| Version pinning | `pnpm-workspace.yaml` `catalog:` |

## Do not

- Do not bulk-read `docs/` — follow links from the documentation map instead.
- Do not implement future-phase scope.
- Do not write raw SQL in app code (Drizzle only; SQL belongs in migrations/RLS).
- Do not call Mastra or any LLM from the browser or with secrets in client code — server routes/actions only.
- Do not import agent modules/prompts/LLM SDKs into `apps/web` — share contracts (types) only and call via the typed client with a scope-claimed service token.
- Do not let agents write tenant records directly — agents draft, humans approve, writes go through web server actions with role checks.
- Do not name a workspace package `mastra` (conflicts with the CLI package).
- Do not put shared app `.env` at monorepo root; Mastra env goes in `apps/agent/.env`.
- Do not propose architecture that contradicts an accepted ADR in [docs/decisions/](../decisions/README.md) without opening a new ADR.
- Do not ship a product dark-mode toggle or fork a second theme in feature folders — follow [docs/design/MASTER.md](../design/MASTER.md).
- Do not use Aceternity decorative effects inside tenant workspace modules — marketing only.

## Decisions

Check [docs/decisions/README.md](../decisions/README.md) before proposing architecture changes. New significant choices get a new ADR in the same change as the code.
