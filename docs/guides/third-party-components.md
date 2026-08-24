# Third-party & registry components (audit gate)

How EduBridge adopts components from the wave of open-source component libraries that
distribute code via shadcn-compatible registries (threeui.com, 21st.dev, Aceternity,
MagicUI, canvasui.dev, dotmatrix).

**Core rule: code is vendored, never depended on.** The shadcn CLI copies source into
our repo; that copy is frozen. Upstream libraries can refactor, republish, or disappear
without breaking us — upgrades are deliberate re-audits, never automatic. Runtime npm
dependencies on niche animation libraries are forbidden. Precedent: `feral-blob` was
added as an npm dep (`^0.1.0`); when the install broke, every auth page crashed with
`Module not found: Can't resolve 'feral-blob'` (removed 2026-08-24).

Skill for exploring/installing: `.agents/skills/registry-components/`.

## The gate — every item must pass before install

1. **Copy, not dependency.** The registry must copy source in. Approved runtime deps
   are limited to `framer-motion` / `motion` / `three` (catalog or semver-pinned).
   Anything else new → user approval first, and prefer rejecting.
2. **Weight budget.** `three` + `@react-three/*` are heavy (~hundreds of KB):
   marketing/public pages only, load via `next/dynamic` (`ssr: false` allowed there),
   never inside `app/[workspace]` tenant modules. Product chrome (auth, shell,
   workspace) stays on CSS keyframes + framer-motion.
3. **License.** MIT / Apache-2.0 preferred; anything else needs the user's sign-off.
4. **Provenance header** at the top of every vendored file:

   ```ts
   // Vendored from ThreeUI (https://threeui.com/r/ball-study.json) via shadcn CLI
   // on 2026-08-24. MIT. Frozen copy — do not sync from upstream.
   ```

5. **Inventory row** added to the table below (component, source, date, deps, usage).
6. **Theme fit.** Semantic tokens / brand slate-blue family only; light-only — strip
   `dark:*` variants the generator emitted; no new `:root` tokens for one component.
7. **Reduced motion.** Component has a static fallback or is gated behind
   `prefers-reduced-motion`.
8. **Verification.** `pnpm lint`, `pnpm check-types`, `pnpm build` pass from root.

## Commands (pnpm only, from repo root)

| Action | Command |
| --- | --- |
| Vendor into the app | `pnpm registry:add @threeui/<name>` |
| 21st.dev component | `pnpm registry:add "https://21st.dev/r/<author>/<name>"` |
| Any registry JSON URL | `pnpm registry:add https://<site>/r/<name>.json` |
| Domain-free shadcn primitive | `pnpm ui:add <name>` (into `packages/ui`) |

App-level aliases/registries: `apps/edubridge/components.json` (`ui` →
`@/components/registry`, `utils` → `@repo/ui/lib/utils`). Vendored files live in
`apps/edubridge/components/registry/<library>/`.

## Inventory of vendored registry components

| Component | Source | Installed | Runtime deps | Used by | License |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |

## Status of animation libraries in the repo (audited 2026-08-24)

| Library | Kind | Status | Risk |
| --- | --- | --- | --- |
| `framer-motion` ^12 | runtime dep (app) | In use — marketing motion (`features/marketing`), `useReducedMotion` respected | Low: major stable lib, semver-pinned |
| `motion` ^12 | runtime dep (`packages/ai-ui`) | In use — AI surfaces (`shimmer`). Same engine as framer-motion under its new name; coexistence is accepted | Low |
| `three` + `@types/three` ^0.185 (catalog) | runtime dep (app) | **Installed but unused** — staged for the planned marketing hero v2 3D rework. When used: gate applies (marketing only, dynamic import) | Medium: heavy; keep usage scoped |
| `@canvas-ui`, `@dotmatrix` registries | vendored copies (`packages/ui`) | In use / available; source frozen in repo | Low: vendored model |
| `feral-blob` | runtime npm dep | **Removed 2026-08-24** — broken dep crashed all auth pages; prompted this policy | Resolved |

## Reviewing / removing

- Treat vendored files as our code: fix bugs in place; do not re-pull from upstream
  without re-running the gate.
- To remove: delete the file(s), its inventory row, and any runtime deps only it used;
  run the verification trio.
