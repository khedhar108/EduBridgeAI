# EduBridge Documentation

Central documentation for the EduBridge monorepo. Use this as the entry point for humans and AI agents.

## Quick links

| Area | Description |
|------|-------------|
| [Roadmap](./roadmap/README.md) | **Phase-wise build plan** — active phase, cross-phase standards, product vision |
| [Architecture](./architecture/README.md) | System-wide structure, monorepo layout, cross-cutting integrations |
| [Features](./features/README.md) | Feature-specific docs (implementation plans, commands, detailed design) |
| [Decisions](./decisions/README.md) | Architecture Decision Records (ADRs) |
| [Guides](./guides/README.md) | How-to guides and conventions |
| [Design](./design/README.md) | Light-only visual system, component policy, AI surfaces, accessibility |
| [Agents](./agents/README.md) | How AI agents should navigate and use this documentation |
| [Build log](./build-log/README.md) | Short chronological journal of milestones + commands |
| [Wayfinder](./wayfinder/control-hub.md) | Spec maps + tickets ([Control Hub](./wayfinder/control-hub.md), [Platform launch](./wayfinder/platform-launch.md), [SIS registration](./wayfinder/student-registration.md), [brand/legal](./wayfinder/brand-legal-and-consent-surfaces.md)) |

## Repository overview

```
edubridge/
├── apps/
│   ├── edubridge/           # Primary Next.js product app (port 3000)
│   ├── web/                 # Mastra starter/demo (port 3002)
│   ├── docs/                # Next.js docs app (port 3001)
│   └── agent/               # Mastra AI service (port 4111)
├── packages/
│   ├── db/                  # Drizzle schema + client (@repo/db)
│   ├── ui/                  # Shared ShadCN components + theme
│   ├── ai-ui/               # AI chat UI primitives
│   ├── eslint-config/
│   └── typescript-config/
├── docs/                    # ← You are here (project documentation)
│   ├── roadmap/             # Phase-wise build plan (start here for "what next")
│   ├── build-log/           # Milestone journal
│   └── design/              # Visual system (light-only MASTER + policies)
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** `>=22.13.0` (required by Mastra templates; see `.nvmrc`)
- **pnpm** `9.15+` (enforced via `only-allow`)

## Common commands

```bash
pnpm install
pnpm dev              # edubridge + agent + UI watcher
pnpm dev:edubridge    # primary app + @repo/ui
pnpm dev:web          # Mastra demo (port 3002) + @repo/ui
pnpm dev:docs         # docs + @repo/ui
pnpm build
pnpm lint
pnpm check-types
```

## Documentation philosophy

| Layer | Location | Purpose |
|-------|----------|---------|
| **Index & overview** | `docs/README.md` (this file) | High-level map and links |
| **Roadmap & phases** | `docs/roadmap/` | What we build, in which order, with standards and exit criteria per phase |
| **Cross-cutting architecture** | `docs/architecture/` | Integrations and patterns that span multiple apps (e.g. Mastra, monorepo) |
| **Feature detail** | `docs/features/<feature>/` | Commands, implementation plan, feature-specific architecture |
| **Decisions** | `docs/decisions/` | Why we chose X over Y (ADRs) |
| **Design** | `docs/design/` | Light-only visual system, component/AI UI policy, a11y |
| **Agent context** | `docs/agents/` | Structured hints for AI coding agents |
| **Build log** | `docs/build-log/` | Chronological milestone journal (commands + key paths) |
| **Wayfinder** | `docs/wayfinder/` | Spec maps + tickets before implementation (local markdown tracker) |

**Rule of thumb:** If it affects more than one app or is a platform choice → `docs/architecture/`. If it is a product capability → `docs/features/<name>/`. If it is visual consistency / theming → `docs/design/`.

## Related root-level docs

- [README.md](../README.md) — Monorepo quick start
- [docs/design/MASTER.md](./design/MASTER.md) — Light-only visual system
- [TAILWIND_SHADCN_GUIDE.md](../TAILWIND_SHADCN_GUIDE.md) — Tailwind + ShadCN setup
- [guides/git-and-release-strategy.md](./guides/git-and-release-strategy.md) — Branches, commits, PRs, changelog
- [CHANGELOG.md](../CHANGELOG.md) — Engineering changelog (`[Unreleased]` → versioned releases)
