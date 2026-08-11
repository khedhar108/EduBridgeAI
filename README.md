# EduBridge

**EduBridge** is a multi-tenant school platform. Each school gets an isolated workspace (own URL, tenant-scoped data via Supabase RLS) with a unified application shell hosting independent modules: **Student Dashboard**, **Report Card Maker**, **Test Paper Creator** — with AI (Mastra multi-step workflows, WhatsApp report sharing) and a plan-based subscription engine (Normal/Pro/Max, 15-day Max trial, per-school module toggles) layered on top.

Built as a **Turborepo monorepo** with **pnpm**, **Next.js**, **Tailwind CSS v4**, **ShadCN UI**, **Supabase**, and **Mastra**.

> Formerly the "Aria" starter — the monorepo tooling is unchanged; the product is EduBridge.

## Rules for AI agents

If you are an AI coding agent working in this repository, follow these rules before writing any code:

1. **Reading order.** Read in this sequence, stopping when you have enough context for the task:
   1. This file (orientation)
   2. [docs/README.md](./docs/README.md) — documentation index
   3. [docs/roadmap/README.md](./docs/roadmap/README.md) — phase plan, **cross-phase standards**, and which phase is active
   4. The **active phase file** in `docs/roadmap/` — the only phase whose scope you may implement
2. **Never implement scope from a future phase** unless the user explicitly asks.
3. **Non-negotiable conventions** (details in [docs/roadmap/README.md](./docs/roadmap/README.md#cross-phase-standards)):
   - Every tenant table carries `school_id` with Supabase **RLS enabled**; role checks are server-side (seven roles: `platform_owner`, `school_admin`, `accountant`, `teacher`, `staff`, `student`, `parent`).
   - **Feature-based folders**: module code lives in `apps/web/features/<module>/`; route files in `apps/web/app/` stay thin. Navigation is defined only in the module registry.
   - AI logic lives only in `apps/agent` (Mastra); the web app calls it through a typed client with scope-claimed service tokens. Agents draft — they never write tenant data directly; writes go through web server actions (see [agent-ecosystem.md](./docs/architecture/agent-ecosystem.md)).
   - Shared, domain-agnostic UI in `packages/ui`; nothing school-specific in shared packages.
   - **pnpm only** (npm/yarn blocked), Node `>=22.13.0`, run commands from the repo root.
4. **Docs move with code.** If your change contradicts a doc in `docs/`, update that doc in the same change.
5. **Styling**: read [docs/design/MASTER.md](./docs/design/MASTER.md) for the light-only visual system, then [TAILWIND_SHADCN_GUIDE.md](./TAILWIND_SHADCN_GUIDE.md) before touching Tailwind/ShadCN setup — the two-compilation model is deliberate.

## Documentation map

| Document                                                                             | Read this when...                                                                 |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [AGENTS.md](./AGENTS.md)                                                             | You are an AI agent (any platform) — the portable rules file                      |
| [docs/README.md](./docs/README.md)                                                   | You need any project documentation                                                |
| [docs/roadmap/README.md](./docs/roadmap/README.md)                                   | You need to know what we build, in which order, and which phase is active         |
| [docs/roadmap/product-vision.md](./docs/roadmap/product-vision.md)                   | You need product context: personas, modules, tenancy, business model              |
| [docs/architecture/README.md](./docs/architecture/README.md)                         | You need cross-cutting technical architecture                                     |
| [docs/architecture/data-access.md](./docs/architecture/data-access.md)               | You touch the database, tenancy, or Drizzle                                       |
| [docs/architecture/multi-tenancy.md](./docs/architecture/multi-tenancy.md)           | You add tenant tables, RLS, or platform-owner boundaries                          |
| [docs/architecture/platform-boundaries.md](./docs/architecture/platform-boundaries.md) | You need SaaS isolation: tenant vs platform vs support, folder map, URLs        |
| [docs/architecture/support-access.md](./docs/architecture/support-access.md)         | You design school-approved temporary support / JIT workspace access             |
| [docs/architecture/auth/README.md](./docs/architecture/auth/README.md)               | You touch sign-in, OTP, passkeys, roles, invitations, or agent auth               |
| [docs/architecture/ai-rag.md](./docs/architecture/ai-rag.md)                         | You touch AI retrieval, embeddings, or vector search                              |
| [docs/architecture/agent-ecosystem.md](./docs/architecture/agent-ecosystem.md)       | You work on the orchestrator/sub-agent AI architecture, memory, or token strategy |
| [docs/architecture/mobile-app.md](./docs/architecture/mobile-app.md)                 | You touch the PWA, Play Store/TWA, iOS wrapper, or the parent app                 |
| [docs/features/README.md](./docs/features/README.md)                                 | You work on a specific feature's docs                                             |
| [docs/decisions/README.md](./docs/decisions/README.md)                               | You propose changing an accepted architecture decision                            |
| [docs/guides/README.md](./docs/guides/README.md)                                     | You need how-to guides and conventions                                            |
| [docs/guides/database-workflow.md](./docs/guides/database-workflow.md)               | You change any table, run migrations, or seed data                                |
| [docs/guides/feature-folder-structure.md](./docs/guides/feature-folder-structure.md) | You create or modify a module in `apps/edubridge/features/`                       |
| [docs/design/README.md](./docs/design/README.md)                                     | You touch UI, theming, layout consistency, or component libraries                 |
| [docs/design/MASTER.md](./docs/design/MASTER.md)                                     | You need the locked light-only visual system (source of truth)                    |
| [docs/agents/README.md](./docs/agents/README.md)                                     | You need extended AI-agent guidance and context strategy                          |
| [docs/build-log/README.md](./docs/build-log/README.md)                               | You need the milestone journal (how we built it)                                  |
| [apps/edubridge/README.md](./apps/edubridge/README.md)                               | You work inside the primary Next.js product app (port 3000)                       |
| [apps/web/README.md](./apps/web/README.md)                                           | You work inside the Mastra starter/demo app (port 3002)                           |
| [apps/docs/README.md](./apps/docs/README.md)                                         | You work inside the docs app (port 3001)                                          |
| [apps/agent/README.md](./apps/agent/README.md)                                       | You work on the Mastra AI service (port 4111)                                     |
| [packages/ui/](./packages/ui/)                                                       | You touch shared ShadCN components or the theme                                   |
| [packages/ai-ui/](./packages/ai-ui/)                                                 | You touch AI chat UI primitives                                                   |
| [TAILWIND_SHADCN_GUIDE.md](./TAILWIND_SHADCN_GUIDE.md)                               | You touch Tailwind/ShadCN setup                                                   |

## Architecture

### Current repository structure

What exists on disk today:

```
edubridge/
├── apps/
│   ├── edubridge/            # Primary Next.js product app (port 3000)
│   │   ├── app/              # Thin routes
│   │   ├── features/         # shell/ + _template/ (Phase 0 modules land here)
│   │   └── lib/              # mastra-client, future auth
│   ├── web/                  # Mastra starter/demo (port 3002)
│   ├── docs/                 # Docs Next.js app (port 3001)
│   └── agent/                # Mastra service @repo/agent (port 4111)
├── packages/
│   ├── db/                   # @repo/db — Drizzle schema + client
│   ├── ui/                   # Shared ShadCN components + global theme
│   ├── ai-ui/                # AI chat UI primitives
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared TS config
├── docs/                     # Project documentation (see Documentation map)
│   ├── roadmap/              # Phase-wise build plan ← "what next" lives here
│   ├── build-log/            # Milestone journal
│   ├── architecture/         # Cross-cutting technical architecture
│   ├── decisions/            # ADRs
│   ├── features/             # Per-feature docs
│   ├── guides/               # Conventions (incl. feature-folder blueprint)
│   ├── design/               # Light-only visual system (MASTER + policies)
│   └── agents/               # AI agent guidance
├── .agents/skills/           # Project-local agent skills (mastra, shadcn, supabase, ...)
├── turbo.json                # Task pipeline
└── pnpm-workspace.yaml       # Workspaces + version catalog
```

### Target structure (feature-based, Phase 0+)

```
edubridge/
├── apps/
│   ├── edubridge/            # Primary Next.js app (port 3000)
│   │   ├── app/              # Routes (thin) — [workspace]/ tenant routes planned
│   │   └── features/         # Feature-based modules
│   │       ├── shell/        #   Unified header, menu, module registry
│   │       ├── student-dashboard/   # Phase 1
│   │       ├── report-cards/        # Phase 3
│   │       ├── test-papers/         # Phase 4
│   │       └── ...
│   ├── web/                  # Mastra demo (port 3002)
│   ├── docs/                 # Docs Next.js app (port 3001)
│   └── agent/                # Mastra AI service (port 4111) — workflows, tools
├── packages/
│   ├── db/                   # @repo/db
│   ├── ui/
│   ├── ai-ui/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
│   ├── roadmap/
│   └── build-log/
├── turbo.json
└── pnpm-workspace.yaml
```

**Module pattern:** each product module is a feature folder in `apps/edubridge/features/<module>/` following the canonical blueprint in [docs/guides/feature-folder-structure.md](./docs/guides/feature-folder-structure.md) (components, hooks, queries, actions, types, public `index.ts`), registered in the shell's module registry with `allowedRoles`, and rendered behind the unified header. Adding a module never touches existing ones. Cross-cutting concerns (tenancy, auth, RBAC) live in `apps/edubridge/lib/` and the database (RLS); data access follows [docs/architecture/data-access.md](./docs/architecture/data-access.md).

## Quick start

```bash
# Requires Node >=22.13.0 and pnpm 9.15+ (npm/yarn are blocked)
pnpm install

pnpm dev                 # edubridge + Mastra agent + UI watchers
pnpm dev:edubridge       # primary app only → http://localhost:3000
pnpm dev:web             # Mastra demo       → http://localhost:3002
pnpm dev:agent           # Mastra only       → Studio at http://localhost:4111
pnpm dev:docs            # docs only         → http://localhost:3001
pnpm dev:all             # everything
```

> The agent needs `apps/agent/.env` (copy from `.env.example`) with the API key
> for your chosen `LLM_PROVIDER` before agent runs will work — Studio itself
> boots without keys. For Drizzle, copy `packages/db/.env.example` → `packages/db/.env`
> (and/or `apps/edubridge/.env.local`) with your Supabase transaction-pooler `DATABASE_URL`.

## Scripts

| Command                                                                         | Description                                                                |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm dev` / `dev:web` / `dev:docs` / `dev:agent` / `dev:web+agent` / `dev:all` | Development servers                                                        |
| `pnpm build` / `build:web` / `build:docs` / `build:ui`                          | Production builds                                                          |
| `pnpm ui:add <name>`                                                            | Add a ShadCN component to `packages/ui` (never inside apps)                |
| `pnpm lint` / `lint:fix`                                                        | Lint monorepo                                                              |
| `pnpm check-types`                                                              | TypeScript check                                                           |
| `pnpm format` / `format:check`                                                  | Prettier                                                                   |
| `pnpm clean:cache`                                                              | Clear all dev caches (`.turbo`, `.next`, `.mastra`, `node_modules/.cache`) |
| `pnpm clean:turbo`                                                              | Clear only Turborepo caches                                                |
| `pnpm clean`                                                                    | Remove build artifacts + node_modules                                      |

## Styling and UI (summary)

- **Visual system:** light-only premium — [docs/design/MASTER.md](./docs/design/MASTER.md). No product dark-mode toggle.
- Tailwind v4 is compiled **twice** on purpose: once in `packages/ui` (components + tokens) and once per app (page-level utilities). Details and rationale: [TAILWIND_SHADCN_GUIDE.md](./TAILWIND_SHADCN_GUIDE.md).
- All design tokens live in `packages/ui/src/styles/globals.css` — change the theme once, all apps inherit.
- ShadCN components live **only** in `packages/ui`; add them from the repo root with `pnpm ui:add <name>` and import as `@repo/ui/components/<name>`.
- Library ladder: `@repo/ui` (product) → `@repo/ai-ui` / CopilotKit (AI) → Aceternity (marketing only). See [docs/design/component-policy.md](./docs/design/component-policy.md).
- Shared dependency versions are pinned in `pnpm-workspace.yaml` under `catalog:` — reference as `"catalog:"` in package.json.

## Adding a new app

1. Create `apps/<name>` as a Next.js app and add deps: `pnpm --filter <name> add @repo/ui next react react-dom` plus dev deps `tailwindcss @tailwindcss/postcss`.
2. Copy `postcss.config.mjs` from `apps/web`; create `app/globals.css` importing `tailwindcss` and `@repo/ui/globals.css`.
3. Import `@repo/ui/styles.css` and `./globals.css` in `app/layout.tsx`; set `transpilePackages: ["@repo/ui"]` in `next.config.js`.
4. Add root scripts `dev:<name>` / `build:<name>`.

Full walkthrough: [TAILWIND_SHADCN_GUIDE.md](./TAILWIND_SHADCN_GUIDE.md).

## CI / production build

```bash
pnpm install --frozen-lockfile
pnpm format:check && pnpm lint && pnpm check-types && pnpm build
```

Turborepo builds `@repo/ui` before apps (`dependsOn: ["^build"]`).

## Where to go next

- **What are we building and in what order?** → [docs/roadmap/README.md](./docs/roadmap/README.md)
- **Why is the system designed this way?** → [docs/architecture/README.md](./docs/architecture/README.md) and [docs/decisions/README.md](./docs/decisions/README.md)
- **How do I document a new feature?** → [docs/guides/documenting-features.md](./docs/guides/documenting-features.md)
