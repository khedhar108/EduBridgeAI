# School registration

Public founder flow: create a school, first admin, and workspace. Instant
provision after email proof. Not staff `/join-school`.

## Routes served

- `/register` — wizard (school, you, workspace)
- `/register/verify` — email OTP
- `/{workspace}?welcome=1` — skippable setup card on the staff home (still path locally; slice D sends founders to `{slug}.edubridge.app`)

Admin home shows the shareable host `{slug}.edubridge.app`. Dual-mode: [workspace-urls.md](../../../../docs/architecture/workspace-urls.md).

## Roles

Anyone (official school or business email in production; any valid email in
development). Becomes the one `school_admin`.

## Email gate

`lib/tenancy/email-domain.ts` — production rejects free providers (Gmail,
Yahoo, Outlook, …). Development accepts any domain so founders can register
with a personal inbox locally. The same gate runs on the server; do not rely
on the wizard copy alone.

## Key files

- `components/register-school-wizard.tsx` — 3-step form
- `actions/register-school.ts` — sign-up, OTP, slug check
- `lib/tenancy/provision-school.ts` — atomic school + admin write

## Depends on

- `lib/tenancy` (slug, provision, email-domain)
- `lib/legal` (terms cookie)
- `@repo/db` (`schools`, `profiles`, `school_members`)
