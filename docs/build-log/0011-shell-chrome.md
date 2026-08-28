# 0011 — Workspace shell chrome

**Date:** 2026-08-08

## Goal

Phase 0.4: document adaptive shell layout, add agent skills, ship workspace header chrome on `feature/shell-chrome`.

## What changed

- Design docs: `shell-layout.md`, `marketing-motion.md`, `loaders.md`; policy + MASTER links
- Agent skills: `edubridge-shell`, `dotmatrix`, `canvas-ui`
- Shell components: Header, AppMenu, ModulePill, SearchBar, ProfileMenu, ShellLayout, AppLoader, module cards
- `modules.ts`: Team module (school_admin only) for role-filtered nav smoke
- Phase 0.4 checklists expanded in roadmap

## Commands

```bash
pnpm lint
pnpm check-types
pnpm --filter edubridge build
```

## Key paths

- `docs/design/shell-layout.md`
- `apps/edubridge/features/shell/components/`
- `apps/edubridge/app/[workspace]/layout.tsx`
- `.agents/skills/edubridge-shell/SKILL.md`

## Next

- PR `feature/shell-chrome` → `development`; smoke teacher vs admin menu
- Later: `feature/marketing-motion` for Canvas UI on `/`
