# Design documentation

Visual identity, component policy, and accessibility for EduBridge UI.

**Start here for UI work:** [MASTER.md](./MASTER.md)

| Document | Read when… |
|----------|------------|
| [MASTER.md](./MASTER.md) | Any UI / theming / layout decision — locked light-only system |
| [shell-layout.md](./shell-layout.md) | Workspace shell anatomy, adaptive header vs module sidebar, AI action contract |
| [marketing-motion.md](./marketing-motion.md) | Canvas UI / brand SVG plan for public `/` only |
| [loaders.md](./loaders.md) | Dotmatrix universal loaders + `AppLoader` wrapper |
| [reference-board.md](./reference-board.md) | You need inspiration URLs and what to steal vs avoid |
| [component-policy.md](./component-policy.md) | Choosing shadcn vs Aceternity vs `@repo/ai-ui` |
| [ai-surfaces.md](./ai-surfaces.md) | CopilotKit dock, voice, AI charts, draft/approve UX |
| [accessibility.md](./accessibility.md) | A11y checklist by role and surface |

Canonical CSS / Tailwind architecture: [`TAILWIND_SHADCN_GUIDE.md`](../../TAILWIND_SHADCN_GUIDE.md).

Page-specific overrides (optional): `docs/design/pages/<page>.md` — only document deviations from MASTER; if no page file exists, MASTER applies exclusively.
