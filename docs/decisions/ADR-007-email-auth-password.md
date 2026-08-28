# ADR-007: Email + password as the Phase 0 auth method

**Status:** Accepted  
**Date:** 2026-08-15

## Context

Phase 0 milestone 0.1 left the email-auth method choice (magic link vs password)
unrecorded. The auth strategy
([strategy.md](../architecture/auth/strategy.md)) lists both email+password and
email OTP/magic link as Phase 0 candidates — password for admins/teachers/staff,
passwordless for parents/students — but the code had to pick one concrete method
to build the first sign-in, office-create, and domain-join flows against.

The implemented flows set credentials server-side:

- Office Add member (`provisionMemberAction`) calls `auth.admin.createUser({ email, password, email_confirm: true })` with a password the coordinator or admin chooses in the staff directory.
- Domain join (`schoolDomainSignUpAction`) calls `supabase.auth.signUp({ email, password })`
  with a password the staff member chooses on `/join-school`.

A decision was needed on which method is the Phase 0 baseline so later phases add
passwordless access additively rather than rework the existing flows.

## Decision

**Email + password is the Phase 0 baseline auth method** for all school roles
that sign in directly (`school_admin`, `accountant`, `teacher`, `staff`).
Accounts are created via `supabase.auth.signUp({ email, password })`.

Email OTP / magic link is **not** the Phase 0 baseline. It remains an additive
later option for passwordless parent/student access, as the strategy matrix
already states. No code written in Phase 0 blocks enabling it later — it is a
Supabase dashboard toggle plus an alternate sign-in route, not a migration.

The platform-owner sign-in (`/platform/sign-in`) and school sign-in (`/sign-in`)
both use email + password today.

## Consequences

### Pros

- One concrete sign-in path to test and maintain for Phase 0 exit.
- Office create / domain-join flows already set passwords server-side — no extra wiring.
- Parents/students are Phase 1 family access (`admission number + DOB`), so
  deferring passwordless avoids building a second auth surface before it's
  needed.
- Adding email OTP later is additive: a Supabase dashboard config + a new
  sign-in route, no schema migration, no RLS change.

### Cons / follow-up

- Password-reset support load stays on the office (directory reset) until
  a self-serve recovery path ships — acceptable for Phase 0–1 pilot scope.
- Must enable email-OTP (or phone OTP) before the parent app scales, to drop the
  password burden for the least-technical user group. Track as Phase 1/2 work.
- No MFA yet for `school_admin`/`platform_owner` — Phase 5 per the strategy.

## References

- [auth/strategy.md](../architecture/auth/strategy.md) — full method matrix and
  scaling path
- [auth/feature-module.md](../architecture/auth/feature-module.md)
- [phase-0-foundation.md](../roadmap/phase-0-foundation.md) (milestone 0.1 ADR
  item; milestone 0.3 auth wiring)
- [family-access.md](../architecture/auth/family-access.md) — Phase 1
  passwordless parent/student entry
