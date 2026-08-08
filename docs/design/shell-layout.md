# Workspace shell layout

> **Decision record** for authenticated school workspace chrome (`/[workspace]/…`).
> Visual tokens: [MASTER.md](./MASTER.md). AI dock placement: [ai-surfaces.md](./ai-surfaces.md).

## Status

| Decision | Choice | Phase |
|----------|--------|-------|
| Global navigation | **Top header** (not permanent left sidebar) | 0.4 |
| Module sub-navigation | **Left slot inside module** when 3+ sections | 1+ |
| AI assistant | **Right collapsible dock** | 2 |
| Marketing motion | **Public `/` only** — [marketing-motion.md](./marketing-motion.md) | Post-0.4 |

## Adaptive hybrid model

```
┌──────────────────────────────────────────────────────────────┐
│ Brand │ App Menu ▾ │ ● Module pill │ Search │ Profile      │  ← Phase 0.4 (always)
├──────────────┬───────────────────────────────┬───────────────┤
│ Module nav   │ Module content                │ AI dock       │
│ (optional)   │                               │ (Phase 2)     │
│ Phase 1+     │                               │               │
└──────────────┴───────────────────────────────┴───────────────┘
```

**Why not a permanent left sidebar in 0.4**

- Phase 0 has one module entry (`Home`) in `modules.ts`; empty sidebar is wasted chrome on mobile.
- MASTER targets **quiet chrome** on data screens — hairline header, flat sections, rare cards.
- Module sidebars belong **inside** a module when depth warrants them (Student Dashboard, Report Cards), not as a second global nav competing with the App Menu.

## Shell anatomy (Phase 0.4)

Every workspace page under `app/[workspace]/` shares:

```
[Logo]  [Application Menu ▾]  [● Active module pill]  [Search]  [Profile]
```

| Slot | Component | Behavior |
|------|-----------|----------|
| Logo | `Header` | EduBridge wordmark; links to workspace home `/{workspace}` |
| Application Menu | `AppMenu` | Dropdown of role-filtered modules from `modules.ts` |
| Active module pill | `ModulePill` | Current module title; click → module home route |
| Search | `SearchBar` | Phase 0: disabled placeholder; Phase 1+: command palette |
| Profile | `ProfileMenu` | Email, role badge, sign out; school switcher when multi-school |

Workspace home (`/{workspace}`) shows **role-relevant module cards** — entry points, not feature data.

## Routes outside this shell

| Route | Shell | Notes |
|-------|-------|-------|
| `/` | Marketing only | [features/marketing/](../../apps/edubridge/features/marketing/) |
| `/sign-in`, `/platform/sign-in` | Auth chrome | No workspace shell |
| `/platform` | Platform console placeholder | Phase 6 owner console; not `ShellLayout` |
| `/[workspace]/…` | **ShellLayout** | All tenant product pages |

Platform owners authenticate at `/platform/sign-in`. School staff at `/sign-in`. Workspace shell applies when the user has an active `school_members` row for that slug.

## RBAC and navigation

1. **Single registry** — `apps/edubridge/features/shell/modules.ts` is the only place module nav is defined.
2. **Server-side filter** — `modulesForRole(ctx.role)` runs in Server Components / layouts; never trust client-only menu filtering.
3. **Forbidden access** — Direct URL to a module the role cannot use → `403` or `notFound()` after server check (same rule as menu visibility).
4. **Roles** — Six platform roles in product docs; `school_members` never stores `platform_owner` (DB constraint). Workspace shell uses `SchoolRole` from session context.

## Responsive behavior

| Breakpoint | App Menu | Search | Profile |
|------------|----------|--------|---------|
| Mobile | Icon + sheet-style dropdown | Icon button, placeholder | Avatar trigger |
| Desktop | “Applications” label + chevron | Full-width field in header (disabled) | Avatar + email truncated |

- Touch targets ≥ 44px (`h-11` minimum on triggers).
- `prefers-reduced-motion`: no decorative header animation.
- Use `min-h-dvh`, `max-w-6xl` content column per MASTER.

## Module sidebar contract (reserved — Phase 1+)

Add a **module-local** left nav only when a feature has **three or more** sibling sections (e.g. Dashboard → Students, Classes, Reports).

```tsx
// Future shape — not implemented in 0.4
type ModuleSidebarProps = {
  workspace: string;
  moduleId: string;
  items: { id: string; title: string; href: string }[];
  activeId: string;
};
```

Rules:

- Module sidebar lives in `features/<module>/`, not `features/shell/`.
- Shell does not render module sidebar; module pages compose `ShellLayout` + optional `ModuleSidebar` in their own layout segment.
- AI dock (Phase 2) remains shell-owned; module sidebar never replaces App Menu.

## AI shell action contract (spec only — Phase 2+)

Mastra agents **do not** manipulate layout DOM. They request **typed shell actions** validated server-side with the same RBAC as human navigation.

| Action | Purpose |
|--------|---------|
| `navigateToModule` | Open allowed module home (`moduleId` from registry) |
| `openRecord` | Deep link within module (`moduleId`, `recordType`, `recordId`) |
| `setModuleFilter` | Apply list filter state (module-owned URL/search params) |
| `openAiDock` | Expand AI dock with optional context scope |

Rejected if: module not in `modulesForRole`, cross-tenant target, or write without human-approve flow per [agent-ecosystem.md](../architecture/agent-ecosystem.md).

## File ownership

| Path | Owns |
|------|------|
| `features/shell/modules.ts` | Nav registry |
| `features/shell/components/*` | Header, AppMenu, ModulePill, SearchBar, ProfileMenu, ShellLayout, AppLoader |
| `features/shell/index.ts` | Public exports only |
| `app/[workspace]/layout.tsx` | Thin: session + `<ShellLayout>` |

## Phase 0.4 non-goals

- Left module sidebar implementation
- CopilotKit / AI dock
- Country or geo-based UI (Phase 6 growth)
- Canvas UI or Aceternity inside workspace
- Full command palette / search backend

## Implementation checklist

See [phase-0-foundation.md](../roadmap/phase-0-foundation.md) § 0.4 for living checkboxes.
