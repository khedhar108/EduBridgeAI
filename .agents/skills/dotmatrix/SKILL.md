---
name: dotmatrix
description: >
  Dotmatrix loaders for EduBridge via shadcn registry. AppLoader wrapper, token
  remap, reduced-motion fallback. Use for workspace Suspense or marketing loaders.
  Slash: /dotmatrix
---

# Dotmatrix loaders

Canonical doc: [docs/design/loaders.md](../../../docs/design/loaders.md).

## When to use

- Installing `@dotmatrix/*` components
- `AppLoader` in `features/shell/components/app-loader.tsx`
- Suspense fallbacks for workspace routes

## Skip

- Button submit pending — use `Spinner` on the button
- Table/chart loading — prefer `Skeleton`
- Workspace decorative animation

## Install

```bash
pnpm dlx shadcn@latest add @dotmatrix/dotm-square-3 -c ./packages/ui
```

Add Dotmatrix `registries` entry to `packages/ui/components.json` when documented by upstream (mirror Aceternity pattern).

## AppLoader pattern

```tsx
"use client";
// features/shell/components/app-loader.tsx
// 1. prefers-reduced-motion → <Spinner />
// 2. else Dotmatrix with text-primary / bg-background
// 3. aria role="status", optional label prop
```

**Import rule:** feature modules use `AppLoader` from `@/features/shell`, not Dotmatrix directly.

## Post-install

- [ ] Remap demo colors to semantic tokens
- [ ] `"use client"` only on loader file
- [ ] `prefers-reduced-motion` branch
- [ ] Fix `@/` imports to `@repo/ui/...` if CLI used wrong alias

## Default variant

Phase 0.4: `@dotmatrix/dotm-square-3`. Additional variants via prop later — one wrapper file.
