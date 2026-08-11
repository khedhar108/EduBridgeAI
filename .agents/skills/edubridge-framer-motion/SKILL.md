---
name: edubridge-framer-motion
description: >-
  EduBridge marketing scroll motion with framer-motion. Use when adding or
  editing landing /modules marketing animations, Reveal/Stagger/HeroEntrance,
  or deciding Canvas UI vs Framer Motion on public pages.
---

# EduBridge Framer Motion (marketing)

## Framer Motion vs `motion/react`

They are the **same library**. Framer Motion rebranded to Motion; `import from "framer-motion"` and `import from "motion/react"` are equivalent APIs.

**EduBridge marketing preference:** `framer-motion` in `apps/edubridge`.

Do not mix both import styles in the same feature folder.

## When to use

- Public `/`, `/modules`, `/blog` scroll storytelling
- Reusable `Reveal`, `Stagger`, `StaggerItem`, `HeroEntrance` from `features/marketing/components/marketing-motion.tsx`

## When not to use

- Tenant `/[workspace]/…` product chrome (calm UI per MASTER)
- Replacing working **particle-object** hero (Three.js; no browser flag)

## Canvas UI vs Framer

| Effect | Library | Needs HTML-in-Canvas flag? |
|--------|---------|----------------------------|
| Hero brand mark | Canvas UI `particle-object` | No |
| Page scroll / section enter | **framer-motion** | No |
| particle-scroll / decrypt-reveal | Canvas UI | **Yes** — avoid as primary UX |

Prefer Framer for scroll. Keep Canvas UI particle-object only where already working.

## Reusable primitives

```tsx
import {
  Reveal,
  Stagger,
  StaggerItem,
  HeroEntrance,
} from "@/features/marketing/components/marketing-motion";
// or from "@/features/marketing" if re-exported

<HeroEntrance delay={0.08}>…</HeroEntrance>
<Reveal direction="up">…</Reveal>
<Reveal direction="down" distance={36}>…</Reveal>
<Stagger>
  <StaggerItem>…</StaggerItem>
</Stagger>
```

- `direction="up"` — content rises into view (default)
- `direction="down"` — content settles downward
- Always honor `useReducedMotion` (built into primitives)
- Client components only (`"use client"`)

## Homepage pattern

- Document scroll (`min-h-dvh`), **not** `ParticleScrollLazy`
- Hero: `HeroEntrance` + particle-object / brand preview
- Below fold: `Reveal` / `Stagger` on modules, security, shell, CTA
- Security band: `MarketingSecurityReveal` (Motion, no decrypt)

## Install

```bash
pnpm --filter edubridge add framer-motion
```

## Docs

Canonical product notes: `docs/design/marketing-motion.md`.
