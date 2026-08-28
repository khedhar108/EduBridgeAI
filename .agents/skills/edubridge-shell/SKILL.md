---
name: edubridge-shell
description: >
  EduBridge workspace shell (Phase 0.4+): Header, AppMenu, ModulePill, SearchBar,
  ProfileMenu, ShellLayout, modules.ts registry, RBAC nav. Use when editing
  app/[workspace]/layout, features/shell, or workspace chrome. Slash: /edubridge-shell
---

# EduBridge shell

Canonical docs: [docs/design/shell-layout.md](../../../docs/design/shell-layout.md), [MASTER.md](../../../docs/design/MASTER.md) § Shell anatomy.

## When to use

- Workspace layout (`app/[workspace]/layout.tsx`)
- Shell components in `apps/edubridge/features/shell/`
- Module registry (`modules.ts`) — **only** place navigation is defined
- Role-filtered menu, module pill, profile menu

## Skip

- Marketing `/` (use **canvas-ui** or **aceternity-ui**)
- Platform `/platform` console (Phase 6)
- Module feature data screens (use module folder + `@repo/ui`)

## Architecture (locked)

| Zone | Phase | Location |
|------|-------|----------|
| Top header | 0.4 | `features/shell/components/` |
| Module left nav | 1+ | Inside `features/<module>/` |
| AI dock | 2 | Shell sibling — [ai-surfaces.md](../../../docs/design/ai-surfaces.md) |

**No permanent left sidebar in 0.4.**

## Registry

```ts
// features/shell/modules.ts — append modules here only
{ id, title, href, icon, allowedRoles }
```

- Filter with `modulesForRole(role)` on the **server**
- Forbidden module URL → `notFound()` or `403` after server check
- Icons: `lucide-react` names in registry; resolve in client components

## Component map

| Component | Responsibility |
|-----------|----------------|
| `Header` | Logo, school slug context |
| `AppMenu` | Dropdown of allowed modules |
| `ModulePill` | Active module from pathname |
| `SearchBar` | Placeholder until command palette |
| `ProfileMenu` | Avatar, email, role, sign out |
| `ShellLayout` | Composes header + children |
| `AppLoader` | Async fallback — see **dotmatrix** skill |

## File rules

- `features/shell/index.ts` — public exports only
- `app/[workspace]/layout.tsx` — thin: `getSessionContext` + `<ShellLayout>`
- No tenant queries in client shell components except via props from RSC parent

## shadcn primitives

Use existing `@repo/ui`: `Button`, `DropdownMenu`, `Avatar`, `Badge`, `Separator`, `Card`.

```bash
pnpm ui:add dropdown-menu avatar badge separator card
```

Follow `.agents/skills/shadcn/SKILL.md` — `gap-*` not `space-y-*`, semantic tokens only.

## AI shell actions (spec only — do not implement DOM control)

Typed server actions later: `navigateToModule`, `openRecord`, `setModuleFilter`, `openAiDock`. Same RBAC as human nav.

## Checklist before merge

- [ ] Menu matches role for teacher + school_admin smoke paths
- [ ] Direct forbidden URL blocked server-side
- [ ] No Aceternity/Canvas UI in workspace shell
- [ ] Touch targets ≥ 44px on mobile triggers
- [ ] `pnpm lint` / `check-types` / `build` green
