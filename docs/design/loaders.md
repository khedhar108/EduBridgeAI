# Universal loaders

> Async loading UX for workspace and marketing. Light-only tokens per [MASTER.md](./MASTER.md).

## Choice: Dotmatrix

[Dotmatrix](https://dotmatrix.zzzzshawn.cloud/getting-started/usage) provides dot-matrix loaders via shadcn registry — one install pattern, many variants.

**Phase 0.4 default variant:** `@dotmatrix/dotm-square-3` (compact, works at small sizes in header/forms).

## Install

```bash
pnpm dlx shadcn@latest add @dotmatrix/dotm-square-3 -c ./packages/ui
```

Add Dotmatrix registry to `packages/ui/components.json` when upstream documents the `registries` URL (same pattern as Aceternity).

## Wrapper: `AppLoader`

Single entry point in `apps/edubridge/features/shell/components/app-loader.tsx`:

- Renders Dotmatrix loader with semantic token colors (`text-primary`, `bg-background`).
- **`prefers-reduced-motion`:** fall back to `@repo/ui` `Spinner` or `Skeleton`.
- Props: `label` (aria), optional `size` (`sm` | `md`).

Do not import Dotmatrix directly from feature modules — use `AppLoader` from `@/features/shell`.

## Where to use

| Surface | Loader | Notes |
|---------|--------|-------|
| Workspace route transitions | `AppLoader` centered in content | Suspense fallback |
| Form submit pending | `Spinner` on button | shadcn pattern — not full-page Dotmatrix |
| Marketing `/` | Dotmatrix optional | Same wrapper; respect effect budget |
| Tables / charts | `Skeleton` | Prefer skeleton over spinner for layout stability |

## Token remap checklist

After any Dotmatrix add:

- [ ] Replace demo black background with `bg-background` / transparent
- [ ] Dot color → `text-primary` or `text-muted-foreground`
- [ ] `"use client"` only on loader component
- [ ] `aria-busy` / `role="status"` on wrapper
- [ ] Reduced-motion branch tested

## Agent skill

Load `.agents/skills/dotmatrix/SKILL.md` (slash: **dotmatrix**) when installing or theming loaders.
