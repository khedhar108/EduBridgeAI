# Node Version and Runtime Pinning

> How Node versions are selected locally and on deployment platforms, why the `DEP0205` deprecation warning appears on Node 26, and how to keep every environment consistent. Read this before changing `engines.node`, `.nvmrc`, or build settings.

## Short answer

Setting an exact version in `engines.node` does **not** reliably pin the runtime:

- `engines.node` is advisory unless `engine-strict=true` is set in `.npmrc`.
- Vercel accepts only major versions in `engines.node` (`22.x`, `24.x`, `20.x`), never an exact version like `22.13.0`.
- Netlify respects `.nvmrc` over `engines.node`.
- GitHub Actions requires explicit `actions/setup-node` configuration.

The right fix is `.nvmrc` + Docker/CI pins, not `engine-strict`. An exact
`engines.node` pin is advisory only.

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
| GitHub Actions | `actions/setup-node` + `.nvmrc` | Workflow: `.github/workflows/ci-cd.yml`. |
| Docker / Coolify | `node:22.13.0-alpine` | Image built on GitHub, not on the VPS. |

## Current repo state

| File | Value | Effect |
|------|-------|--------|
| `.nvmrc` | `22.13.0` | Local + CI pin (use nvm/fnm). |
| `package.json` (root) | `"node": ">=22.13.0"` | Advisory. Do not set `engine-strict` — it would refuse a laptop on Node 24/26. |
| Docker / GitHub Actions | `22.13.0` | Hard pin for production images. |
| Vercel | Node **22.x** in project settings | Do not leave the dashboard on 24. |

## Recommended change

Do not pin an exact version in `engines.node`. Keep an advisory floor:

```json
"engines": {
  "node": ">=22.13.0"
}
```

Do **not** enable `engine-strict`. CI and Docker already pin `22.13.0`. A strict
range would refuse a laptop on Node 24 or 26.

Set the Vercel project to Node **22.x**. Revisit only if Vercel 22 is retired.

## What still needs an upstream fix

Even with the pins above, this is symptom management:

1. Wait for `drizzle-kit` to bundle a `tsx` release that uses `module.registerHooks()`.
2. Run `pnpm update` and re-test `pnpm build` on the latest allowed Node.
3. Once no `DEP0205` appears on Node 26, the warning can be ignored as gone.

Do not suppress the warning globally with `NODE_OPTIONS=--no-deprecation`. That hides all deprecations, including ones this repo might introduce later.

## Verification

```bash
node -v
# Prefer 22.13.0 (`nvm use`). Other majors still install.

pnpm install
pnpm build
# No DEP0205 on Node 22.13.0.
```
