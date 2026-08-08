# Marketing motion (public site)

> Plan for premium motion on **`/` only**. Workspace routes (`/[workspace]/…`) stay calm per [MASTER.md](./MASTER.md).

## Status

**Documented in Phase 0.4; implemented after shell PR** on branch `feature/marketing-motion`.

## Libraries

| Library | Registry | Allowed surfaces |
|---------|----------|------------------|
| **Canvas UI** | `@canvas-ui/*` via shadcn CLI | `apps/edubridge/features/marketing/` |
| **Aceternity** | `@aceternity/*` | Same — see [component-policy.md](./component-policy.md) |
| **Dotmatrix** | `@dotmatrix/*` | Marketing loaders + workspace async states — [loaders.md](./loaders.md) |

**Forbidden:** Canvas UI, Aceternity beams/spotlight, particle heroes inside tenant workspace modules.

## Canvas UI integration plan

Install from repo root (targets `packages/ui` via `pnpm ui:add`, then move or re-export into marketing feature folder):

```bash
pnpm dlx shadcn@latest add @canvas-ui/particle-scroll-react -c ./packages/ui
```

Candidate components and section mapping:

| Component | Marketing section | Message |
|-----------|-------------------|---------|
| [particle-scroll](https://canvasui.dev/docs/components/particle-scroll) | Hero background | Premium, alive platform |
| [particle-object](https://canvasui.dev/docs/components/particle-object) | Hero accent | Brand focal object |
| [decrypt-reveal](https://canvasui.dev/docs/components/decrypt-reveal) | Security / trust strip | Tenant isolation, RLS |
| [laser](https://canvasui.dev/docs/components/laser) | Feature divider | Section transition |
| [asciify](https://canvasui.dev/docs/components/asciify) | Optional dev/AI teaser | AI-native (use sparingly) |
| [blaze](https://canvasui.dev/docs/components/blaze) | CTA band | High-energy close |

### Install workflow

1. Add registry entries to `packages/ui/components.json` when Canvas UI documents them (mirror Aceternity `registries` block).
2. Run `pnpm dlx shadcn@latest add @canvas-ui/<name> -c ./packages/ui`.
3. Copy or re-export into `apps/edubridge/features/marketing/components/` — keep marketing-only imports out of `@repo/ui` default barrel if the effect is heavy.
4. Fix imports: `@/` → `@repo/ui/...` or `@/features/marketing/...` per monorepo aliases.
5. Remap hard-coded colors to semantic tokens (`bg-background`, `text-primary`, `border-border`).
6. Wrap in `dynamic(..., { ssr: false })` for canvas/WebGL effects.

## Effect budget

- **Max 1–2** motion-heavy effects visible per viewport.
- Honor `prefers-reduced-motion`: static fallback (gradient + typography only).
- Lazy-load below-the-fold effects.
- No layout shift: reserve aspect ratio / min-height for hero.

## Brand SVG guidelines

Assets live under `apps/edubridge/public/brand/` (create in marketing-motion branch):

| Asset | Use | Rules |
|-------|-----|-------|
| `logo-mark.svg` | Favicon, app icon source, header compact | Single-color or two-tone from `--primary` / `--foreground` |
| `wordmark.svg` | Marketing header, OG images | Pair with MASTER display font (serif) in HTML where possible |
| `module-icons/` | Future module cards | Lucide-aligned stroke; 24px grid; no emoji |

- SVGs use `currentColor` or CSS variables — no embedded neon hex.
- Workspace shell uses **wordmark text or mark** at small sizes — no animated SVG in header.
- Export favicon set (`favicon.ico`, `apple-touch-icon`) from mark.

## Current marketing baseline

[marketing-home.tsx](../../apps/edubridge/features/marketing/components/marketing-home.tsx) uses token-only gradient + grid (no third-party motion). Canvas UI replaces or augments **hero only** in the motion branch.

## Phase gate

1. Merge Phase 0.4 shell (`feature/shell-chrome` → `development`).
2. Branch `feature/marketing-motion` from `development`.
3. Implement one hero effect first (particle-scroll or decrypt-reveal), then add sections incrementally.
4. Run `pnpm lint`, `check-types`, `build`; verify Lighthouse / CLS on `/`.

## Agent skill

Load `.agents/skills/canvas-ui/SKILL.md` (slash: **canvas-ui**) when adding or reviewing Canvas UI components.
