---
name: canvas-ui
description: >
  Canvas UI (@canvas-ui) for EduBridge marketing only — particle-object hero,
  optional particle-scroll / decrypt-reveal. Homepage scroll prefers framer-motion
  (see edubridge-framer-motion). Forbidden in workspace routes. Slash: /canvas-ui
---

# Canvas UI (marketing only)

Canonical doc: [docs/design/marketing-motion.md](../../../docs/design/marketing-motion.md).  
Registry / MCP: [canvasui.dev/docs/mcp](https://canvasui.dev/docs/mcp).  
**Scroll / section enter:** use [edubridge-framer-motion](../edubridge-framer-motion/SKILL.md) (`framer-motion`), not particle-scroll, as the default on `/`.

## When to use

- Hero **particle-object** brand mark (no browser flag)
- Optional flag-gated effects (particle-scroll, decrypt) for local canvas preview
- `apps/edubridge/features/marketing/components/`
- Brand SVG under `public/brand/`

## Skip

- **Homepage document scroll** — prefer `Reveal` / `Stagger` / `HeroEntrance` from framer-motion
- **`/[workspace]/` tenant screens** — hard ban per MASTER + component-policy
- Shell header, AppMenu, product module chrome
- Aceternity + Canvas UI stacking in same viewport (max 1–2 motion effects)

## Install

```bash
pnpm dlx shadcn@latest add @canvas-ui/particle-scroll-react -c ./packages/ui
pnpm dlx shadcn@latest add @canvas-ui/decrypt-reveal-react -c ./packages/ui
```

Or via MCP (see below): ask the assistant to add `@canvas-ui/<name>` into `packages/ui`.

Vendor stays in `packages/ui/src/components/canvasui/` (import `@repo/ui/components/canvasui/*`). Thin wrappers only in `features/marketing/components/`.

Registry is already pinned in `packages/ui/components.json`:

```json
"@canvas-ui": "https://canvasui.dev/r/{name}.json"
```

## MCP server (shadcn + Canvas UI)

Use the [Canvas UI MCP docs](https://canvasui.dev/docs/mcp) with the **shadcn MCP server** so the assistant can list/install registry components.

### Cursor (this repo)

`.cursor/mcp.json` ships with:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

1. Open **Cursor Settings → MCP** and enable **shadcn**.
2. Restart Cursor if the server does not appear.
3. Try prompts:
   - Show me the components in the `@canvas-ui` registry
   - Add `@canvas-ui/laser-react` into `packages/ui` for the marketing divider

Re-init anytime:

```bash
pnpm dlx shadcn@latest mcp init --client cursor
```

### Other clients

| Client | Setup |
|--------|--------|
| Claude Code | `npx shadcn@latest mcp init --client claude` then restart; `/mcp` to debug |
| VS Code | `npx shadcn@latest mcp init --client vscode` → Start in `.vscode/mcp.json` |
| Codex | `[mcp_servers.shadcn]` in `~/.codex/config.toml` with `npx shadcn@latest mcp` |
| OpenCode | `npx shadcn@latest mcp init --client opencode` |

CLI without MCP still works: `pnpm ui:add @canvas-ui/liquid-react` (or `pnpm dlx shadcn@latest add @canvas-ui/... -c ./packages/ui`).

## Component mapping

| Component | Section | Status |
|-----------|---------|--------|
| particle-scroll | Full-page scroll shell | Live (`ParticleScrollLazy`, calm EduBridge preset) |
| particle-object | Hero brand mark | Live (`DEFAULT_BRAND_MARK`) |
| decrypt-reveal | Trust / security strip | Live (`MarketingSecurityReveal` → `DecryptRevealLazy`) |
| module cards | Homepage → `/modules/[slug]` | Live (`MarketingModuleCards`) |
| laser | Section divider | Not started |
| blaze | CTA band | Not started |

## Browser (particle-scroll + decrypt)

Requires Chromium **HTML-in-Canvas** (`drawElementImage` / `layoutsubtree`).

**Pages cannot flip `chrome://flags` automatically** (browser security). Use one of:

### A. Dev launch script (preferred)

With `pnpm dev:edubridge` running:

```bash
pnpm canvas:preview
# or: pnpm canvas:preview -- http://localhost:3000/blog
```

Launches Canary / Brave / Chrome / Edge with `--enable-blink-features=CanvasDrawElement` and a dedicated profile under `~/.edubridge/chromium-canvas-profile`. Script: `scripts/open-marketing-canvas.mjs`.

### B. Manual flag

1. Chrome Canary / recent Brave: `chrome://flags/#canvas-draw-element` (Brave: `brave://flags/#...`)
2. Set **Enabled**, restart browser

Without the flag, components fall back to plain UI (no cipher / particle-scroll dissolve). **Particle-object does not need this flag.**

## Particle object — swap design only

Edit **`apps/edubridge/public/brand/logo-mark.svg`**. Do not fork the wrapper for design changes.

## Decrypt-reveal

```tsx
<DecryptRevealLazy>{/* trust points */}</DecryptRevealLazy>
<MarketingModuleCards /> // → /modules/[slug]
```

Hex only for `color` / `background`. Panel needs explicit height. Homepage security band: `MarketingSecurityReveal` (dense fence copy inside decrypt). Module cards are the interactive discovery surface.

## Required patterns

```tsx
"use client";
import dynamic from "next/dynamic";

export const ParticleScrollLazy = dynamic(
  () => import("./particle-scroll-page").then((m) => m.ParticleScrollPage),
  { ssr: false, loading: () => <div className="h-dvh w-full bg-background" /> },
);

<ParticleScrollLazy>{/* entire page */}</ParticleScrollLazy>
<ParticleObjectBrandLazy />
<DecryptRevealLazy>{/* trust panel */}</DecryptRevealLazy>
```

- Effect budget: 1–2 animated regions per viewport
- Never nest particle-scroll in a short dashed box — needs `100dvh` + tall content
- No import from `features/shell/` into marketing canvas wrappers

## Post-install checklist

- [ ] `exports` entry in `packages/ui/package.json`
- [ ] Exclude vendor from `packages/ui` tsconfig if needed
- [ ] Lazy + `ssr: false`
- [ ] Update `docs/design/marketing-motion.md`
- [ ] Verify with `pnpm canvas:preview` (HTML-in-Canvas on)

## Phase gate

Implement on `feature/marketing-motion` **after** shell PR merges to `development`.
