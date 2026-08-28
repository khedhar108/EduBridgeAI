# Auth

Identity UI and server actions for EduBridge (Supabase Auth).

## Routes served

- `/sign-in` — school members
- `/join-school` — school-domain sign-up (pending until admin activates)
- `/platform/sign-in` — platform owner
- `/auth/callback` — magic-link / OAuth code exchange
- `/accept-invite/[token]` — invitee sets name + password
- `/[workspace]/settings/team` — invites + pending domain-join queue

## Layout

All auth surfaces share `AuthShell` — a centered two-part card (`brand panel`
+ `form column`) over a drifting `MeshGradient`, with an animated gradient bar
across the card top — via `app/(auth)/layout.tsx`; `/platform/sign-in` wraps
itself since it sits outside the route group. Gradient/mesh colors are
token-derived only (`var(--accent)`, `var(--primary)`, `var(--ring)`,
`var(--chart-2)`) so the brand stays slate-blue/teal and light-only; motion
lives in `app/globals.css` (`.mesh-blob-*`, `.gradient-bar`) and respects
`prefers-reduced-motion`.

Auth method is email + password (ADR-007).

## Demo accounts (local only)

`DemoAccountsModal` (rendered on sign-in/join pages) lists the seeded local
logins from `docs/guides/auth-local-vs-prod.md` and fills the sign-in form on
click. It is gated by `process.env.NODE_ENV !== "production"` so it never
ships. Prefill flows through `lib/demo-accounts.ts`: same-surface fills use a
`window` CustomEvent; cross-surface fills (owner → `/platform/sign-in`) stash
the email/password in `sessionStorage` and the target form consumes it on
mount.

## Membership paths

1. **Invite** — admin picks email + role; token link; membership on accept
2. **Domain join** — email domain matches `schools.official_email_domain` →
   pending `membership_requests` → admin activates with role on team dashboard

Domain match never auto-grants workspace access or `school_admin`.

## Roles

- School users: membership from `school_members` after invite accept or admin activate
- Platform owner: `app_metadata.platform_owner` (Phase 6 → `platform_admins`)

## AI boundary

`apps/agent` never receives user cookies. Product app mints short-lived service
tokens with validated tenant claims only — see `docs/architecture/auth/agent-auth.md`.

## Depends on

- `lib/auth`, `lib/tenancy`, `lib/access`
- `@repo/ui` form primitives
- `@repo/db` invitations + membership_requests + `withTenant`
