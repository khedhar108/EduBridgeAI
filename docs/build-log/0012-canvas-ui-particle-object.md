# 0012 — Canvas UI particle scroll + 3D brand object

**Date:** 2026-08-09

## Goal

Wire Canvas UI on public `/`: full-page particle-scroll shell and hero ParticleObject (3D particle brand mark), with feature-folder docs and swappable SVG versioning.

## What changed

- Installed `@canvas-ui/particle-scroll-react` and `@canvas-ui/particle-object-react` into `packages/ui` (`three` + catalog entries)
- Marketing wrappers: `ParticleScrollPage` / `ParticleScrollLazy`, `ParticleObjectBrand` / `ParticleObjectBrandLazy`, `DEFAULT_BRAND_MARK`
- Hero right column uses ParticleObject with `src={DEFAULT_BRAND_MARK}` → `/brand/logo-mark.svg` (v2 eye + black-hole outer; `logo-mark-v2.svg` versioned copy)
- Docs: `docs/design/marketing-motion.md` (particle-object + decrypt-reveal), canvas-ui skill, `features/marketing/README.md`
- Vendor imports via `@repo/ui/components/canvasui/*` (explicit package exports; tsconfig/eslint exclude for vendor noise)

## Commands

```bash
pnpm dlx shadcn@latest add @canvas-ui/particle-scroll-react -c ./packages/ui --yes
pnpm dlx shadcn@latest add @canvas-ui/particle-object-react -c ./packages/ui --yes
pnpm install
pnpm lint --filter edubridge
pnpm check-types --filter edubridge
pnpm build --filter edubridge
```

## Key paths

- `apps/edubridge/features/marketing/README.md`
- `apps/edubridge/features/marketing/components/canvasui/`
- `apps/edubridge/public/brand/logo-mark.svg`
- `packages/ui/src/components/canvasui/ParticleObject.tsx`
- `packages/ui/src/components/canvasui/ParticleScroll.tsx`
- `docs/design/marketing-motion.md`
- `.agents/skills/canvas-ui/SKILL.md`

## Next

- Install decrypt-reveal for trust strip (effect budget ≤2)
- PR marketing Canvas UI with shell chrome when ready → `development`
- Optional: drop temp Dotmatrix loader preview from marketing home
