# Accessibility

Non-negotiable for EduBridge web + parent PWA. Complements [MASTER.md](./MASTER.md) and [mobile-app.md](../architecture/mobile-app.md).

Target: **WCAG 2.2 AA** for product surfaces unless a phase doc raises the bar.

## Global rules

| Rule | Requirement |
|------|-------------|
| Contrast | Text ≥4.5:1; large text / UI glyphs ≥3:1 |
| Focus | Visible focus rings on all interactive elements; never `outline-none` without a replacement |
| Touch | Minimum ~44×44px targets; ≥8px gap between targets |
| Labels | Visible labels on inputs — not placeholder-only |
| Keyboard | Full keyboard reachability; tab order matches visual order |
| Motion | Honor `prefers-reduced-motion` for non-essential animation |
| Color | Never convey status by color alone — add icon/text |
| Live regions | Toasts/errors: `aria-live` polite/assertive as appropriate; toasts must not steal focus |
| Zoom | Do not disable pinch-zoom / user scalabilty |
| Skip link | Skip to main content on app shell |

## By persona / surface

### Parent (mobile-first / PWA)

- One primary action per screen; bottom-safe area for sticky CTAs
- Large tap targets; avoid hover-only affordances
- Admission number / DOB flows: correct `inputMode`, autocomplete attributes, clear errors under fields
- Charts: short text summary required (see AI summary pattern)

### Teacher / staff (dense entry)

- Compact density may reduce padding later — **never** shrink below touch minimums on mobile breakpoints
- Tables: sortable headers with `aria-sort`; sticky first column when horizontal scroll is unavoidable
- Bulk actions: confirm destructive; undo toast when feasible

### School admin / platform owner

- Complex settings: progressive disclosure; field groups with legends
- Cross-tenant owner console: clear tenant context in headings so screen readers announce school scope

### Students

- Age-appropriate copy; avoid ambiguous icons without text on primary nav
- Read-only dashboards still need accessible chart summaries

## Forms and feedback

- `Field` + `FieldLabel`; validation: `data-invalid` on field, `aria-invalid` on control
- Error text names the problem and how to fix it
- After submit error: focus first invalid field
- Loading buttons: `disabled` + spinner; announce busy state where needed
- Confirm before destructive (AlertDialog)

## Overlays

- Dialog / Sheet / Drawer: required Title (visually hidden only if `sr-only` and purpose is clear)
- Escape / explicit close; restore focus to trigger on close
- Scrim opacity strong enough to isolate content (~40–60% black)

## AI dock and voice

- Toggle has accessible name (“Open assistant” / “Close assistant”)
- Focus trap only while dock/sheet is open; Esc closes
- Voice states announced; typed fallback always available
- Draft/approve flows expose status to AT (“Draft pending approval”)

## Charts

- Text summary or `aria-label` with key insight
- Legend visible; do not rely on red/green alone
- Keyboard path to data details when points are interactive
- Loading: Skeleton; empty: Empty component; error: Alert + retry

## Pre-merge checklist

- [ ] Contrast checked for new text/surfaces on light canvas
- [ ] Focus visible on new controls
- [ ] Touch targets OK on 375px width
- [ ] Labels + error placement correct
- [ ] Reduced-motion path OK
- [ ] Status not color-only
- [ ] Overlays have titles and Esc
- [ ] Charts have text alternative
- [ ] AI dock named and escapable
