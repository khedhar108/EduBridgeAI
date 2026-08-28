# 0015 — Auth shell + feral-blob mascot

**Date:** 2026-08-23

## Goal

Ship an enhanced split-screen auth layout with a form-reactive jelly-blob mascot on all sign-in / sign-up surfaces, plus docs housekeeping from the architecture audit.

## What changed

- Docs: indexed build-log 0014 + ADR-007, refreshed Phase 0 status, fixed 3 broken `customer-feedback-summarization` links, fixed `apps/web` → `apps/edubridge` drift in `.cursor/rules/30-ai-agents.mdc` and roadmap, corrected AGENTS.md build-log index pointer.
- New skill `.agents/skills/feral-blob/` (API, theming vars, form-reactive patterns, EduBridge guardrails).
- New `features/auth` components: `AuthShell` (split brand panel + form column), `AuthHeader` (title + mascot row), `AuthBlob` (client; feral-blob `JellyBlobMascot` re-themed to brand slate-blue via `--jelly-*` vars; watches typing via document focus/keydown listeners, `mood="password"` on password fields, angry on over-poke; `aria-hidden`).
- `app/(auth)/layout.tsx` applies the shell to the whole group; `/platform/sign-in` wraps itself (outside the group). Pages reduced to thin content (routes stay thin). Copy: em-dashes removed, stale "link expired" error copy updated for password auth.
- Deps (pnpm): `feral-blob`, `motion` in `apps/edubridge`.

## Commands

```bash
pnpm --filter edubridge add feral-blob motion
pnpm --filter edubridge lint
pnpm --filter edubridge check-types
pnpm --filter edubridge build
```

Note: root `pnpm lint` / `check-types` currently fail on pre-existing `@repo/db` (console warnings in untracked scripts) and `@repo/agent` (missing `@mastra/*` modules) issues, unrelated to this change; edubridge-scoped commands are green.

## Key paths

- `apps/edubridge/features/auth/components/{auth-shell,auth-header,auth-blob}.tsx`
- `apps/edubridge/app/(auth)/layout.tsx`
- `.agents/skills/feral-blob/SKILL.md`

## Next

Visual smoke test of all six auth surfaces in the browser (desktop split + mobile collapse, blob reactions).
