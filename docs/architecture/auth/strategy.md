# Auth Strategy — One Low-Cost Solution That Scales

> Decision: **Supabase Auth only**, custom shadcn/Tailwind UI, Drizzle for membership data. No Clerk, no Better Auth, no separate auth service. This file explains the choice, the method matrix, and the cost/scaling path.

## Why Supabase Auth and not Clerk/Better Auth

| Factor | Supabase Auth (chosen) | Clerk | Better Auth |
|--------|------------------------|-------|-------------|
| RLS + tenancy | Native — session JWT and RLS claims live in one system | Requires third-party-auth JWT integration into Supabase; a second system to keep in sync | Self-hosted; we'd own token issuance against Supabase |
| Multi-role model | Handled by our `school_members` table on top of Supabase identities | Clerk orgs/roles would duplicate `school_members` — two sources of truth | Same duplication problem |
| Cost at school scale | Free tier generous; priced per project, not per-MAU | Per-MAU pricing; schools have many low-frequency users (parents) — worst case for MAU billing | Free, but ops burden on us |
| Passkeys/fingerprint | Native beta since May 2026 | Native, mature | Plugin ecosystem, more wiring |
| Auth UI | None — we build it (we want full design control anyway) | Prebuilt components (would clash with the unified shell) | None |

**Bottom line:** the entire multi-tenancy model (RLS claims, `school_members`, `withTenant`) is built around Supabase identities. Introducing Clerk means proxying Clerk JWTs into Supabase or duplicating membership — more cost, more sync bugs, zero user-visible benefit.

## Auth method matrix

School users range from tech-savvy admins to parents on low-end phones. Every persona gets a low-friction path:

| Method | Supabase support | Who it's for | Phase |
|--------|------------------|--------------|-------|
| Email + password | Built-in | Admins, teachers, staff (traditional baseline) | 0 |
| Email OTP / magic link | Built-in (`signInWithOtp`) | Parents, students — no password to forget | 0 (enable), polish later |
| Phone OTP (SMS) | Built-in (`signInWithOtp` phone) via SMS provider (Twilio/MessageBird/Vonage...) | Parents/staff in phone-first contexts | 1–2 (per-SMS cost; configure provider in dashboard when the pilot demands) |
| Admission no. + student DOB | Custom server action → session for the parent's read-only member record | Parents in the mobile app — zero-friction, no password/OTP | 5–6 ([feature-module.md](./feature-module.md#parent-access-admission-number--dob)) |
| Passkeys (fingerprint/Face ID/Windows Hello) | **Native beta (May 2026)** — WebAuthn | Everyone, as a fast re-entry method | Post-MVP (beta → GA watch) |
| OAuth (Google) | Built-in | Optional convenience later | Not planned |
| MFA (TOTP) | Built-in | `school_admin`, `platform_owner` — protect high-privilege accounts | 5 |

### Passkeys / fingerprint — the WebAuthn path

You do **not** need a separate WebAuthn library (SimpleWebAuthn etc.) or a third-party passkey provider. Supabase shipped **native passkey support in beta** (May 28, 2026):

- Dashboard: **Authentication → Passkeys** → enable, set the WebAuthn Relying Party (your domain).
- Client: `@supabase/supabase-js >= v2.105.0` with explicit opt-in:

```typescript
const supabase = createClient(url, key, {
  auth: { experimental: { passkey: true } },
});

// Register (user must already be signed in — passkeys complement first signup, not replace it)
await supabase.auth.registerPasskey();

// Sign in — discoverable credentials: user taps fingerprint, no email typed
await supabase.auth.signInWithPasskey();
```

Beta constraints to design around: SSO-only and anonymous users can't register passkeys; challenges expire (retry on `webauthn_challenge_expired`); API may change before GA — pin the supabase-js version and watch the changelog. **Rollout:** email/password + email OTP in Phase 0, passkeys as an optional "Enable fingerprint sign-in" toggle in profile settings once stable. Additive, no migration, no bottleneck.

## Auth UI: custom, with shadcn + Tailwind

Supabase ships **no production React UI kit** (`@supabase/auth-ui` is legacy). That's fine — our screens must match the unified shell and handle EduBridge extras (workspace slug, role-aware redirects, invite acceptance). Implementation lives in `apps/web/features/auth/` — see [feature-module.md](./feature-module.md).

## Passwordless-first for parents

Parents are the largest and least technical group. Default for them: **email OTP or phone OTP sign-in, no password** — later passkeys for one-tap re-entry. This eliminates password-reset support load, the #1 auth cost at school scale.

## Cost and scaling path

| Stage | What we run | Cost |
|-------|-------------|------|
| Phase 0–1 (pilot) | Supabase free tier, email/password + email OTP | Zero |
| Phase 2 (AI live) | Same + SMS provider account for phone OTP (pay-as-you-go per SMS) | Pennies per OTP |
| Post-MVP | + passkeys (free, native) | Zero |
| Phase 5 (SaaS) | Supabase paid project as school count grows; TOTP MFA for privileged roles | Predictable per-project pricing |

The key property: **nothing in this path requires re-architecture.** Each row adds a Supabase feature flag or dashboard config, not a migration.

## References

- [Supabase passkeys guide](https://supabase.com/docs/guides/auth/passkeys) · [changelog (beta, May 2026)](https://supabase.com/changelog/46458-passkeys-for-supabase-auth-beta)
- [Supabase SSR with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [rbac-model.md](./rbac-model.md) — roles and membership
- [../data-access.md](../data-access.md) — session context + RLS mechanics
