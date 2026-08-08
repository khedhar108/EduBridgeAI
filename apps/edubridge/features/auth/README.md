# Auth

Identity UI and server actions for EduBridge (Supabase Auth).

## Routes served

- `/sign-in` — school members
- `/join-school` — school-domain sign-up (pending until admin activates)
- `/platform/sign-in` — platform owner
- `/auth/callback` — magic-link / OAuth code exchange
- `/accept-invite/[token]` — invitee sets name + password
- `/[workspace]/settings/team` — invites + pending domain-join queue

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
