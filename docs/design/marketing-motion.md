# Marketing motion (public site)

> Premium motion on public marketing routes only. Workspace routes (`/[workspace]/…`) stay calm per [MASTER.md](./MASTER.md).

## Status (current)

| Piece | Status | Library |
|-------|--------|---------|
| Homepage `/` scroll + section enter | **Live** — document scroll + `Reveal` / `Stagger` / `HeroEntrance` | **framer-motion** |
| `particle-object` hero mark | Live via `ParticleObjectBrandLazy` | Canvas UI (Three.js; no flag) |
| Module **cards** → `/modules/[slug]` | Live (`MarketingModuleCards`) | framer-motion hover |
| Security / trust band | Live via `MarketingSecurityReveal` (Motion only) | framer-motion |
| `particle-scroll` page shell | Optional / legacy — still used on `/modules` showcase pages | Canvas UI (**needs HTML-in-Canvas flag**) |
| `decrypt-reveal` | Available in packages; **not** primary homepage UX | Canvas UI (flag) |

**Preference:** scroll storytelling = `framer-motion`. Keep Canvas UI **particle-object** for the brand hero. Do not rely on particle-scroll / decrypt-reveal as the default landing experience (most browsers never enable the experimental flag).

## Framer Motion vs `motion/react`

Same library, two package names. Framer Motion rebranded to Motion; APIs match.

**EduBridge marketing uses `framer-motion`** (`import from "framer-motion"`). Do not mix `motion/react` in `features/marketing/`.

Install:

```bash
pnpm --filter edubridge add framer-motion
```

Skill: `.agents/skills/edubridge-framer-motion/SKILL.md`.

## Reusable primitives

Source: `apps/edubridge/features/marketing/components/marketing-motion.tsx`  
Re-exported from `features/marketing` `index.ts`.

| Export | Use |
|--------|-----|
| `HeroEntrance` | First-paint hero (not scroll-triggered) |
| `Reveal` | Section enter on document scroll (`direction`: `"up"` \| `"down"`) |
| `Stagger` + `StaggerItem` | Staggered lists / grids |

All honor `useReducedMotion`. Client components only.

Homepage pattern:

- Root: `min-h-dvh` normal document scroll (**not** `h-dvh` + ParticleScroll)
- Hero: `HeroEntrance` + particle-object / brand preview
- Below fold: `Reveal` / `Stagger` on modules, security, shell, CTA

## Browser note (Canvas UI flag-gated effects)

`particle-scroll` and `decrypt-reveal` need experimental **HTML-in-Canvas** (`drawElementImage` / `layoutsubtree`). Sites cannot enable `chrome://flags` for visitors.

Local preview only:

```bash
pnpm dev:edubridge   # terminal 1
pnpm canvas:preview  # terminal 2 — Chromium with CanvasDrawElement
```

Without the flag, wrappers fall back to plain UI. **Particle-object does not need the flag.**

## Libraries

| Library | Allowed surfaces |
|---------|------------------|
| **framer-motion** | Public marketing scroll / entrance / card hover |
| **Canvas UI** particle-object | Marketing hero brand mark |
| **Canvas UI** particle-scroll / decrypt | Optional; prefer Framer for production scroll |
| **Aceternity** | Marketing only — [component-policy.md](./component-policy.md) |

**Forbidden:** Canvas UI / Aceternity beams inside tenant workspace modules.

## Canvas UI vendor (optional effects)

```bash
pnpm dlx shadcn@latest add @canvas-ui/particle-scroll-react -c ./packages/ui
pnpm dlx shadcn@latest add @canvas-ui/particle-object-react -c ./packages/ui
pnpm dlx shadcn@latest add @canvas-ui/decrypt-reveal-react -c ./packages/ui
```

Vendored under `packages/ui/src/components/canvasui/`. Thin wrappers in `features/marketing/components/`.

Calm particle-scroll preset (when used on `/modules`): see `particle-scroll-page.tsx` (`point` 0.75, lower drift/swirl). Do **not** stack Framer `Reveal` inside an active ParticleScroll shell — they fight.

## Effect budget

- Max **1–2** motion-heavy effects per viewport (e.g. particle-object + one scroll beat)
- Honor `prefers-reduced-motion`
- Lazy-load WebGL / Canvas UI (`*Lazy` wrappers, `ssr: false`)

## Brand SVG

| Asset | Use |
|-------|-----|
| `public/brand/logo-mark-drop.svg` | **Default** hero mark + root icon — Drop of Education (purple/teal bands, amber core) |
| `public/brand/logo-mark-ring.svg` | Ring of Education (concentric rings) |
| `public/brand/EduBridge_logo.svg` | Book + pencil + circle variant |
| `public/brand/logo-mark.svg` | Legacy eye (archive) |
| Wordmark / module icons | Per MASTER |

Preview-only: `brand-mark-preview.tsx` cycles `BRAND_MARK_VARIANTS`. Remove by replacing `<BrandMarkPreview />` with `<ParticleObjectBrandLazy src={DEFAULT_BRAND_MARK} />` in `marketing-home.tsx`.

Leave particle-object `color=""`; put brand colors in the SVG.

## Module cards + showcases

Bento cards → `/modules/[slug]`. Content under `features/marketing/modules/`. `/blog` = product notes. Public in `proxy.ts`.

## Agent skills

| Skill | When |
|-------|------|
| `edubridge-framer-motion` | Scroll / Reveal / Stagger on marketing |
| `canvas-ui` | Adding or reviewing Canvas UI vendor components |
