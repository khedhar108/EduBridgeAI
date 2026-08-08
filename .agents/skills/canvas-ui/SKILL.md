---
name: canvas-ui
description: >
  Canvas UI (@canvas-ui) for EduBridge marketing homepage only. particle-scroll,
  decrypt-reveal, laser, etc. Forbidden in workspace routes. Slash: /canvas-ui
---

# Canvas UI (marketing only)

Canonical doc: [docs/design/marketing-motion.md](../../../docs/design/marketing-motion.md).

## When to use

- Public `/` marketing hero and trust sections
- `apps/edubridge/features/marketing/components/`
- Brand SVG planning under `public/brand/` (later branch)

## Skip

- **`/[workspace]/` tenant screens** — hard ban per MASTER + component-policy
- Shell header, AppMenu, module pages
- Aceternity + Canvas UI stacking in same viewport (max 1–2 motion effects)

## Install

```bash
pnpm dlx shadcn@latest add @canvas-ui/particle-scroll-react -c ./packages/ui
```

Move or re-export heavy components into `features/marketing/components/` so workspace bundles do not pull canvas by default.

## Component mapping

| Component | Section |
|-----------|---------|
| particle-scroll / particle-object | Hero |
| decrypt-reveal | Security / trust |
| laser | Section divider |
| blaze | CTA band |

## Required patterns

```tsx
import dynamic from "next/dynamic";

const ParticleScroll = dynamic(
  () => import("./particle-scroll-hero").then((m) => m.ParticleScrollHero),
  { ssr: false },
);
```

- `prefers-reduced-motion`: static gradient fallback (see current `marketing-home.tsx`)
- Semantic tokens only after install
- Effect budget: 1–2 animated regions per viewport

## Post-install checklist

- [ ] Remap colors to `bg-background`, `text-primary`, `border-border`
- [ ] Fix monorepo import paths (`@repo/ui/...`)
- [ ] No import from `features/shell/` or workspace modules
- [ ] Lazy load + `ssr: false` for WebGL/canvas
- [ ] Verify CLS on `/`

## Phase gate

Implement on `feature/marketing-motion` **after** shell PR merges to `development`.
