# EduBridge Design System — Master

> **Source of truth** for visual identity, layout grammar, and UI consistency.
> Agents: read this before any UI work. Page-specific overrides (if any) live under `docs/design/pages/` and override only what they name.

## Locked decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Theme | **Light only** | Schools, classrooms, outdoor parent phones, report cards/PDFs. Premium = craft + AI surfaces, not a dark-mode toggle. |
| Dark mode | **Out of scope** | Existing `.dark` tokens in `packages/ui` stay dormant. Never ship a theme switcher until a later phase explicitly asks. |
| Product chrome | `@repo/ui` (shadcn) | Tables, forms, shell, dialogs, charts |
| AI surfaces | `@repo/ai-ui` + CopilotKit slots | Chat, voice, streaming, insight cards |
| Marketing motion | Aceternity (selective) | Landing / pricing only — never tenant data screens |
| Icons | `lucide-react` only | No emoji-as-icons |

Full library ladder: [component-policy.md](./component-policy.md). AI patterns: [ai-surfaces.md](./ai-surfaces.md). A11y: [accessibility.md](./accessibility.md). References: [reference-board.md](./reference-board.md).

---

## Aesthetic direction

**Tone:** Institutional premium + AI-native. Calm paper/stone canvas, charcoal type, one brand accent. Quiet chrome. Dense, scannable data. AI feels designed-in (summaries, dock, voice), not bolted-on purple glow.

**Anti-clichés (forbidden as brand identity):**

- Purple-on-white or purple→indigo gradient themes
- Warm cream (#F4F1EA-ish) + terracotta + high-contrast serif “AI spa” look
- Broadsheet / hairline newspaper layouts
- Glassmorphism stacks, neon glow, rounded-full pill clusters
- Decorative Background Beams / Spotlight / Glare inside the workspace
- Default Inter / Roboto / Arial / system stacks as brand fonts
- Shipping both light and dark as first-class product themes

---

## Color system

Tokens live only in [`packages/ui/src/styles/globals.css`](../../packages/ui/src/styles/globals.css) (`:root` OKLCH → `@theme inline`). Feature modules never invent hex/oklch.

### Roles (semantic — use these classes)

| Role | Typical use | Class examples |
|------|-------------|----------------|
| Canvas | Page floor | `bg-background` |
| Foreground | Body / titles | `text-foreground` |
| Muted | Secondary text, AI dock wash | `bg-muted`, `text-muted-foreground` |
| Card / popover | Elevated surfaces when needed | `bg-card`, `bg-popover` |
| Primary | Primary CTA, key emphasis | `bg-primary`, `text-primary` |
| Secondary / accent | Subtle chrome | `bg-secondary`, `bg-accent` |
| Destructive | Delete / irreversible | `bg-destructive`, `text-destructive` |
| Border / input / ring | Hairlines, fields, focus | `border-border`, `ring-ring` |
| Sidebar | Shell rail + AI dock kinship | `bg-sidebar`, `text-sidebar-foreground` |
| Chart 1–5 | Series only | `var(--chart-*)` via Chart config |

### Brand guidance (retune targets — Phase 0 shell)

When tokens are retuned from the starter neutral palette:

- Keep the canvas **near-white / soft stone**, not pure marketing white glare on every surface
- One **teal or ink accent** for primary actions and AI “alive” affordances — not rainbow accents
- Success / warn / danger stay semantic and accessible (≥4.5:1 on text, ≥3:1 for large UI glyphs)
- Color means **status or brand**, never decoration

Marketing and app **share the same `:root`**. Do not fork a second palette for landing.

---

## Typography

| Role | Guidance |
|------|----------|
| Display | Distinctive serif or characterful sans for marketing heroes and rare product moments (e.g. Fraunces or equivalent). Final pair locked when fonts ship. |
| Body / UI | Refined geometric or neo-grotesk for product chrome (e.g. DM Sans / Geist-like). Never Inter/Roboto/Arial as brand. |
| Mono | Code, IDs, admission numbers — tabular where possible |
| Scale | Consistent steps (e.g. 12 / 14 / 16 / 18 / 24 / 32). Body ≥16px on mobile. |
| Measure | ~35–60 chars mobile; ~60–75 desktop for long copy |
| Line-height | 1.5–1.75 body; tighter for display |

Product UI hierarchy uses **weight and size**, not colored headings.

---

## Spacing, radius, elevation

| Token | Rule |
|-------|------|
| Spacing | 4 / 8pt rhythm. Prefer `gap-*` + flex/grid — never `space-y-*` / `space-x-*` in new UI. |
| Radius | Follow `--radius` from tokens (`rounded-md` / `lg` family). Avoid random `rounded-full` except avatars and true pills that are interactive toggles. |
| Elevation | Prefer hairline borders over stacked shadows. One subtle elevation scale for overlays (dialog, popover, AI dock). |
| Cards | **Rare.** Only when the container holds a user interaction. Inside the shell prefer flat sections + `Separator`. |

Equal width/height → `size-*`, not `w-* h-*`.

---

## Shell anatomy

Every workspace page shares one header (product vision):

```
[Logo]  [Application Menu ▾]  [● Active module pill]  [Search]  [Profile]
```

- **Application Menu** — role-filtered modules (never show forbidden items to the client)
- **Active module pill** — non-interactive indicator of the current module (`aria-current="page"`); module switching happens via the Application Menu
- **Search** — module-scoped first, then workspace
- **Profile** — account, role badge, school switcher, sign out

Homepage under the header: role-relevant module entry points. Modules are feature folders; they inherit shell + tokens — they do not invent nav or themes.

**Layout architecture:** Phase 0.4 ships a **top header only** (no permanent left sidebar). Module-local sidebars and the right AI dock are phased — see [shell-layout.md](./shell-layout.md).

Density:

| Density | Use |
|---------|-----|
| `comfortable` (default) | Parents, students, most admin screens |
| `compact` (later) | Teacher mark/attendance entry grids |

---

## Motion

| Rule | Detail |
|------|--------|
| Purpose | Motion expresses cause→effect (open dock, stream tokens, confirm success) — not decoration |
| Duration | Micro 150–300ms; complex ≤400ms |
| Properties | Prefer `transform` / `opacity` only |
| Presets | Share one motion vocabulary file when implemented (e.g. `apps/web/lib/motion.ts`) — no magic numbers per component |
| Reduced motion | Honor `prefers-reduced-motion`: shorten or disable non-essential animation |
| Marketing | Aceternity allowed on public marketing only; strip demo decoration; remap to tokens |

Hard ban in modules: Background Beams, Spotlight, Glare Card, infinite marquees, nested glassmorphism.

---

## Charts and data

- Use shadcn **Chart** (Recharts) with tokenized `--chart-1`…`--chart-5`
- Pair charts with an **AI summary block** above (Attio pattern): one short narrative + optional suggested action — see [ai-surfaces.md](./ai-surfaces.md)
- Tables remain first-class for marks, attendance, fees — do not replace every table with a chart
- Empty / loading / error states are required (Skeleton / Empty / Alert) — never a blank axis frame

---

## States (premium shows up here)

Every interactive control needs distinct: default, hover, focus-visible, active, disabled, loading (where async).

- Focus rings: visible (`ring-ring` / outline) — never remove for aesthetics
- Buttons: disable + spinner pattern during pending; no fake “isLoading” prop invented on Button
- Forms: visible labels; errors under fields; `data-invalid` / `aria-invalid` per shadcn Field patterns
- Toasts: `sonner`; polite live regions; do not steal focus

---

## Canonical CSS ownership

Documented in detail in [`TAILWIND_SHADCN_GUIDE.md`](../../TAILWIND_SHADCN_GUIDE.md).

| File | Owns |
|------|------|
| `packages/ui/src/styles/globals.css` | Design tokens (`:root`, dormant `.dark`, `@theme inline`) |
| `packages/ui/src/styles.css` | Precompile scan → `dist/index.css` |
| `apps/web/app/globals.css` | App Tailwind + `@import "@repo/ui/globals.css"` + `@source` |
| App `layout.tsx` | Imports `@repo/ui/styles.css` **and** `./globals.css` |

Rules:

1. Change tokens only in `packages/ui` globals
2. Semantic classes only — never raw palette utilities for brand color in features
3. Light-only product: never toggle `class="dark"` on `<html>` / providers for product theme
4. CopilotKit / third-party UI remapped to the same CSS variables
5. App-level overrides in app `globals.css` are for layout quirks only — not a second theme

---

## Consistency operating model

- New modules inherit shell + tokens; no local color systems in `features/<module>/`
- Prefer composing `@repo/ui` components over custom styled `div`s
- UI work reads: this file → [component-policy.md](./component-policy.md) → [accessibility.md](./accessibility.md) as needed
- Docs move with code: if a change contradicts this file, update MASTER in the same change

### Pre-merge UI checklist

- [ ] Semantic tokens only (no ad-hoc hex)
- [ ] Light-only (no dark toggle / no `.dark` reliance for product)
- [ ] Focus visible; touch targets ≥44px where tappable
- [ ] Labels, empty/loading/error states present
- [ ] `prefers-reduced-motion` respected for non-essential motion
- [ ] Aceternity not used inside tenant workspace data screens
- [ ] Role-filtered nav unchanged (server-side)
- [ ] AI drafts show human-approve path where writes are involved

---

## Out of scope (later implementation)

MASTER locks targets; Phase 0+ shell work implements:

- Final OKLCH retune and font loading
- Shell components + module registry UI
- Shared `motion.ts` presets
- CopilotKit dock wired to Mastra
- Density `compact` for teacher entry

Do not invent a second aesthetic while those ship.
