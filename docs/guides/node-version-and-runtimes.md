# Node Version and Runtime Pinning

> How Node versions are selected locally and on deployment platforms, why the `DEP0205` deprecation warning appears on Node 26, and how to keep every environment consistent. Read this before changing `engines.node`, `.nvmrc`, or build settings.

## Short answer

Setting an exact version in `engines.node` does **not** reliably pin the runtime:

- `engines.node` is advisory unless `engine-strict=true` is set in `.npmrc`.
- Vercel accepts only major versions in `engines.node` (`22.x`, `24.x`, `20.x`), never an exact version like `22.13.0`.
- Netlify respects `.nvmrc` over `engines.node`.
- GitHub Actions requires explicit `actions/setup-node` configuration.

The right fix is a **bounded range** plus engine enforcement, not an exact pin.

## The DEP0205 warning

`DEP0205` is Node's deprecation warning for the legacy `module.register()` API:

- `module.register()` was deprecated in Node 25.9.0.
- Node 26.0.0 made it a runtime warning.
- The replacement is `module.registerHooks()`, available since Node 22.15.0.

This repo does **not** call `module.register()`. The call comes from a TypeScript loader bundled inside a dependency. Confirmed offender: `drizzle-kit@0.31.10` bundles `tsx`, whose register helper still uses the old API. Other toolchain packages may do the same.

The warning is harmless and does not affect build output. Fixing it is an upstream dependency update, not a code change in this repo.

## How each environment selects Node

| Environment | Reads | Notes |
|-------------|-------|-------|
| Local (nvm/fnm/volta) | `.nvmrc` | Repo currently pins `22.13.0`. |
| Vercel | `engines.node` | Major versions only. Vercel currently offers 20, 22, and 24; Node 26 is not deployable there, so DEP0205 cannot occur on Vercel today. |
| Netlify | `NODE_VERSION` env > `.nvmrc`/`.node-version` > `engines.node` | Existing `.nvmrc` already wins unless an env var overrides it. |
| GitHub Actions | nothing automatic | Must use `actions/setup-node` with `node-version-file: '.nvmrc'`. No workflow exists in this repo yet. |

## Current repo state

| File | Value | Effect |
|------|-------|--------|
| `.nvmrc` | `22.13.0` | Correct local pin. |
| `package.json` (root) | `"node": ">=22.13.0"` | Allows Node 26, which is where the warning appears. |
| `apps/agent/package.json` | `"node": ">=22.13.0"` | Same. |
| `.npmrc` | only `store-dir` | No `engine-strict`, so pnpm warns but does not block mismatches. |
| `.node-version` | absent | Fine; `.nvmrc` is enough. |
| CI workflow | absent | Nothing to update yet. |

## Recommended change

Do not pin an exact version in `engines.node`. Use a bounded range that excludes the only range where DEP0205 fires while still allowing every deployment platform's supported versions.

In both root `package.json` and `apps/agent/package.json`:

```json
"engines": {
  "node": ">=22.13.0 <26"
}
```

Then enforce it in `.npmrc`:

```ini
engine-strict=true
```

This keeps Node 22 and 24 working, blocks Node 26 from silently running in local or CI installs, and leaves the door open to re-enable Node 26 once the upstream loader packages migrate to `module.registerHooks()`.

## What still needs an upstream fix

Even with the range above, this is symptom management:

1. Wait for `drizzle-kit` to bundle a `tsx` release that uses `module.registerHooks()`.
2. Run `pnpm update` and re-test `pnpm build` on the latest allowed Node.
3. Once no `DEP0205` appears on Node 26, the upper bound can be removed.

Do not suppress the warning globally with `NODE_OPTIONS=--no-deprecation`. That hides all deprecations, including ones this repo might introduce later.

## Verification

```bash
node -v
# Expect 22.13.0 locally.

pnpm install
# With engine-strict=true, this fails loudly if Node is outside the range.

pnpm build
# No DEP0205 on Node 22.13.0.
```
