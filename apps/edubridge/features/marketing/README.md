# Marketing

Public `/` landing for EduBridge (light-only, institutional premium). Motion + optional Canvas UI live here only — never in `[workspace]` routes.

## Routes

| Path | Component |
|------|-----------|
| `/` | `MarketingHome` (framer-motion + particle-object hero) |
| `/modules` | `ModuleIndex` (still particle-scroll shell) |
| `/modules/[slug]` | `ModuleShowcase` (still particle-scroll shell) |
| `/blog` | `BlogIndex` (product notes index) |
| `/blog/[slug]` | `BlogArticleView` |

## Key files

- `components/marketing-home.tsx` — document scroll; `HeroEntrance` / `Reveal`; particle-object hero; module cards; security; shell; CTA
- `components/marketing-motion.tsx` — reusable **framer-motion** primitives (`Reveal`, `Stagger`, `StaggerItem`, `HeroEntrance`)
- `components/marketing-module-cards.tsx` — bento cards → `/modules/[slug]`
- `components/marketing-security-reveal.tsx` — trust band (Motion, not decrypt-reveal)
- `modules/` — showcase folder (content per slug + shared `ModuleShowcase`)
- `modules/components/module-media-slot.tsx` — dashed placeholder or `next/image` when `src` is set
- `content/modules.ts` — homepage bento card registry
- `particle-scroll-*.tsx` / `canvasui/*` — optional Canvas UI (flag-gated scroll/decrypt; particle-object needs no flag)

## Modules on the homepage

Student Dashboard, AI Assist, Timetable Maker, Report Card Designer, Fee Structure, Receipt Creation, Test Paper Creator. Each card links to `/modules/<slug>`.

To update a showcase: edit `modules/content/<slug>.ts` only. Layout stays in `ModuleShowcase`.

To add images later: put files under `public/marketing/modules/<slug>/` and set `src` on `hero` / section `media`.

## Motion dials (landing `/`)

- Prefer **framer-motion** for scroll storytelling (works in all browsers)
- Hero: `HeroEntrance` + Canvas UI **particle-object**
- Below fold: `Reveal` / `Stagger` — normal document scroll (`min-h-dvh`)
- Do **not** wrap `/` in `ParticleScrollLazy` (flag-dependent; poor default UX)
- Card hover springs stay on `MarketingModuleCards`

## Auth note

`proxy.ts` treats `/`, `/modules`, and `/blog` as public marketing. Unauthenticated visitors must not be bounced to `/sign-in` for those paths.

## Depends on

- `@repo/ui`, `framer-motion`, `lucide-react`, `three`
- `docs/design/MASTER.md`, `docs/design/marketing-motion.md`
- Skills: `edubridge-framer-motion`, `canvas-ui`, `design-taste-frontend`

## Forbidden

- Canvas UI / Aceternity in workspace modules
- Editing particle-object wrappers for design swaps — edit `public/brand/logo-mark.svg` only
- Deep imports into `components/canvasui/` — use `features/marketing` `index.ts`
- Mixing `motion/react` and `framer-motion` imports in this feature
