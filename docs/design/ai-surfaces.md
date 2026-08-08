# AI surfaces

How CopilotKit, Mastra, voice, and AI charts sit inside the **light-only** shell without looking like a bolted-on demo.

Align with [agent-ecosystem.md](../architecture/agent-ecosystem.md): agents **draft**; humans **approve**; tenant writes go through web server actions.

## Placement in the shell

```
┌─────────────────────────────────────────────┬──────────────────┐
│  Unified header (logo, modules, search…)    │                  │
├─────────────────────────────────────────────┤  AI dock         │
│                                             │  (CopilotSidebar │
│  Active module content                      │   or embedded    │
│  (tables, forms, charts + AI summary)       │   chat pane)     │
│                                             │                  │
└─────────────────────────────────────────────┴──────────────────┘
```

- Prefer **CopilotSidebar** (or equivalent dock) as a sibling to main content — collapsible, does not reflow the whole page permanently when closed
- Dock uses `sidebar` / `muted` tokens for kinship with shell chrome — composed contrast, **not** a dark theme
- Mobile: dock becomes full-height sheet / drawer; keep ≥44px toggle; do not trap focus without escape

Docs: [CopilotKit Sidebar](https://docs.showcase.copilotkit.ai/prebuilt-components/sidebar), [slots](https://docs.showcase.copilotkit.ai/custom-look-and-feel/slots), [styling notes](https://github.com/CopilotKit/CopilotKit/blob/main/showcase/STYLING-GUIDE.md).

## Theming CopilotKit

1. Map CopilotKit CSS variables / slot `className`s to EduBridge semantic tokens (`bg-background`, `bg-sidebar`, `border-border`, `text-muted-foreground`, primary for send)
2. Prefer **slots** (Tailwind string, props, or custom components) over global `!important` overrides on internal classes
3. Wrapper pattern for layout spacing — size the dock with outer wrappers; do not fight purged dynamic classes
4. Streaming markdown / code / mermaid: reuse `@repo/ai-ui` streamdown / ai-elements where present

## AI summary + chart pattern (Attio-style)

For dashboards and student progress:

1. **Summary block** (first): short parent/teacher-friendly narrative from Mastra draft, with source scope clear (which student / term)
2. **Suggested actions** (optional): secondary buttons — “Share via WhatsApp”, “Open report card draft” — that invoke server actions, not silent agent writes
3. **Chart** (below): shadcn Chart with tokenized series; legend + text alternative for a11y
4. States: Skeleton while loading; Empty when no data; Alert + retry on failure

Never show a chart alone as the “AI feature.” The narrative is the AI surface; the chart is evidence.

## Voice

- Visible control (mic) with clear states: idle, listening, processing, error, denied permission
- Do not rely on voice alone — always offer typed input in the same dock
- Announce state changes via `aria-live="polite"`; never auto-start listening without user gesture
- Respect OS permission denials with recovery copy (“Enable microphone in browser settings”)

## Human-approve drafts

| Agent output | UI requirement |
|--------------|----------------|
| Report summary | Preview + Edit + Confirm before share/send |
| Report card commentary | Draft badge; admin/teacher approve path |
| Test paper generation | Review list; explicit “Save to bank” / “Create test” |
| Parent Q&A (later) | Cite read-only scope; no silent mutations |

Visual language: `Badge` for “Draft” / “Pending approval”; primary button = human confirm; destructive separated.

## Empty and first-run AI

- First open of the dock: welcome copy scoped to role (“Ask about this class’s attendance”) — no generic “How can I help?”
- If the school plan lacks AI modules: explain upgrade / trial — do not show a broken chat

## Anti-patterns

- Floating purple orb with glow as the only AI entry
- Chat widget that ignores shell tokens
- Agent writing marks/fees directly from the dock
- Decorative canvas effects behind chat messages inside the workspace
- Dual light/dark chat themes independent of product theme
