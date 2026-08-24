---
name: registry-components
description: >
  Explore and vendor third-party animated / 3D components from shadcn-CLI-compatible
  registries (threeui.com, 21st.dev, Aceternity, MagicUI, canvasui.dev, dotmatrix) into
  EduBridge with pnpm. Use when browsing a component-library site for a candidate,
  installing one, auditing an already-vendored one, or fixing a failed registry install.
  Triggers: "threeui", "21st.dev", "21st", "shadcn registry", "registry component",
  "ball-study", "mengto", "copy component from <site>", "add component from a library site".
---

# Registry components (threeui, 21st.dev, any shadcn registry)

The model: registries **copy source into our repo** (vendored). We never take runtime
npm deps on niche animation libraries — precedent: `feral-blob` was added as an npm dep,
the install broke, and every auth page crashed with `Can't resolve 'feral-blob'`. A
vendored copy is frozen; upstream can change freely without breaking us.

## Where things install

From repo root, pnpm only (`packageManager` makes the shadcn CLI use pnpm; never npx/npm):

| Target | Command | Lands in |
| --- | --- | --- |
| App vendored zone (marketing / feature visuals) | `pnpm registry:add @threeui/<name>` | `apps/edubridge/components/registry/` |
| 21st.dev (author-scoped, URL form) | `pnpm registry:add "https://21st.dev/r/<author>/<name>"` | same |
| Any registry with a JSON endpoint | `pnpm registry:add https://<site>/r/<name>.json` | same |
| Domain-free shadcn primitives | `pnpm ui:add <name>` | `packages/ui` |

Registry aliases live in `apps/edubridge/components.json` (`@threeui`, `@21st`; `ui` →
`@/components/registry`, `utils` → `@repo/ui/lib/utils`). Canvas UI / dotmatrix stay
configured in `packages/ui/components.json` — use their own skills.

## Explore (find a candidate)

1. Browse the gallery — threeui.com, `21st.dev/@mengto/library/threeui`, ui.aceternity.com,
   magicui.design — via WebFetch/WebSearch or the browser; galleries are public.
2. Open the component's page and capture: install name, declared deps (`three`?
   `motion`? `@react-three/*`?), license (MIT preferred).
3. Confirm the page exposes a registry install command (a `/r/<name>.json` endpoint).
   No registry = manual copy is allowed, but the provenance header is written by hand.

## Audit gate — must pass BEFORE install

Full checklist: `docs/guides/third-party-components.md`. Condensed:

1. **Copy, not dependency.** If installing would add a runtime dep on a niche animation
   lib (anything outside `framer-motion`/`motion`/`three`, all catalog/semver-pinned) —
   stop and ask the user.
2. **Weight.** `three` + `@react-three/*` ≈ heavy → marketing/public pages only,
   dynamic import (`next/dynamic`, `ssr: false` allowed there); never inside
   `app/[workspace]` tenant modules or `packages/*`.
3. **Provenance.** Prepend a header comment to the vendored file(s) — source URL,
   registry, date, license, "frozen copy" — and add a row to the inventory table in
   `docs/guides/third-party-components.md`.
4. **Theme.** Re-theme to semantic tokens / brand slate-blue; strip `dark:*` variants
   (product is light-only).
5. **Reduced motion.** Static fallback or `prefers-reduced-motion` gate.
6. **Verify.** `pnpm lint`, `pnpm --filter edubridge check-types`, `pnpm build:edubridge`.

## After install

- Tidy placement under `components/registry/<library>/` if the CLI dropped files flat.
- Feature code imports the file directly; the registry dir is not a feature module and
  gets no `index.ts`.
- Removing later = delete file + inventory row + any deps only it used.

## Failure modes

- `Can't resolve '<lib>'` after install → a runtime dep snuck in via the registry's
  package list; remove the import and re-audit (rule 1).
- Tailwind v3-era classes in generated code → remap to v4 semantic tokens; never add
  `:root` colors for a single component.
- Non-deterministic render (random poses/seeds) breaking hydration → gate our wrapper
  behind a `mounted` state flag; decorative only, keep `aria-hidden`.
