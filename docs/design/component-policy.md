# Component policy

Layered ownership so EduBridge stays consistent as AI chat, voice, and charts land.

## Ladder (prefer earlier steps)

1. **Compose existing `@repo/ui`** — Button, Field, Table, Dialog, Chart, Sidebar patterns, etc.
2. **Add via shadcn CLI** into `packages/ui` — `pnpm ui:add <name>` from repo root.
3. **`@repo/ai-ui` + CopilotKit slots** — chat, streaming markdown, voice affordances, tool UIs.
4. **Aceternity** (`@aceternity` registry) — **marketing / public landing only**.
5. **Hand-roll last** — only when nothing above fits; still use semantic tokens + `cn()`.

## Ownership matrix

| Layer | Package / registry | Allowed for | Forbidden for |
|-------|--------------------|-------------|-----------------|
| Product chrome | `@repo/ui` (shadcn New York, neutral base, CSS variables) | Shell, forms, tables, dialogs, navigation, charts | School-domain business logic |
| AI surfaces | `@repo/ai-ui`, CopilotKit, Mastra client wiring | Chat, stream-in text, voice UI, AI insight cards, human-in-the-loop tools | Raw LLM calls / prompts in the web app |
| Marketing motion | Aceternity (`pnpm dlx shadcn@latest add @aceternity/...`) | Public landing, pricing, waitlist heroes | Tenant workspace modules, mark entry, admin tables |
| Icons | `lucide-react` (catalog) | All UI | Emoji as structural icons |
| Motion | `motion` + shared presets (when added) | Meaningful transitions | Decorative beams inside data screens |

## Install paths

### ShadCN (product)

```bash
# Repo root
pnpm ui:add button
pnpm ui:add chart
```

- Lands in `packages/ui/src/components/`
- Import: `@repo/ui/components/<name>`
- Follow [TAILWIND_SHADCN_GUIDE.md](../../TAILWIND_SHADCN_GUIDE.md)

### Aceternity (marketing only)

1. Ensure `packages/ui/components.json` (or the marketing app’s config) includes:

```json
"registries": {
  "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
}
```

2. Add with the project runner, targeting the correct package/app config:

```bash
pnpm dlx shadcn@latest add @aceternity/background-beams -c ./packages/ui
```

Prefer installing marketing-only components under the **web marketing route tree** or a clearly named marketing components folder — not as default exports of `@repo/ui` consumed by every module.

### `@repo/ai-ui`

- Domain-free AI primitives only (existing `components/llm/*`, `components/ai-elements/*`)
- CopilotKit theming via slots + CSS variables — see [ai-surfaces.md](./ai-surfaces.md)
- Never put school-specific copy or tenant queries inside the package

## Post-install checklist (Aceternity / third-party)

After any registry add:

- [ ] Remap hard-coded colors to semantic tokens (`bg-background`, `text-muted-foreground`, etc.)
- [ ] Strip demo decoration (dashed debug frames, forced dark wrappers, demo blues)
- [ ] Confirm `"use client"` only where required
- [ ] Respect `prefers-reduced-motion` for non-essential animation
- [ ] Fix imports to monorepo aliases (`@repo/ui/...`) — third-party registries often assume `@/components/ui`
- [ ] Verify the component is **not** imported from a tenant feature module unless it is a shared primitive that meets MASTER

## Hard bans inside modules (`apps/web/features/**`)

- Background Beams, Spotlight, Glare Card, infinite marquees
- Nested glassmorphism / glow stacks
- Local theme providers or `.dark` toggles
- Parallel icon libraries
- Raw `bg-blue-500` / hex brand colors

## Composition rules (shadcn)

Mirror the shadcn skill critical rules:

- `className` for layout, not recoloring primitives
- `gap-*` not `space-y-*` / `space-x-*`
- `size-*` for equal dimensions
- Semantic colors only; no manual `dark:` overrides for product theme
- Forms: `FieldGroup` + `Field`; overlays need Titles; icons via `data-icon` where applicable

## Decision cheat sheet

| Need | Use |
|------|-----|
| Button, dialog, table, form | `@repo/ui` |
| Analytics chart | shadcn Chart in `@repo/ui` + AI summary block |
| In-app assistant | CopilotKit sidebar themed to tokens + `@repo/ai-ui` pieces |
| Landing hero animation | Aceternity (marketing route) |
| School mark entry grid | Quiet shadcn Table / inputs — no Aceternity |
