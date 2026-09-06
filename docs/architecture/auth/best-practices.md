# Auth Best Practices and Launch Checklist

> The security checklist for anything touching authentication or authorization in EduBridge. Review before shipping auth changes; review in full before pilot launch and before Phase 5 public registration.

## Session handling (Supabase SSR)

| Practice | Why |
|----------|-----|
| Always `getUser()` for auth checks — never `getSession()` | `getSession()` reads the cookie without verifying the JWT against Supabase |
| Middleware refreshes the session on every request | Rotating refresh tokens stay valid; prevents random logouts |
| Redirect unauthenticated users in middleware, not client components | Client-side guards flash protected content |
| Cookies: httpOnly, secure, sameSite=lax (Supabase SSR defaults) | Token theft via XSS/mitm |
| Every auth action handles `{ data, error }` and calls `revalidatePath("/", "layout")` | No stale auth state in the cache |

## Anti-enumeration and abuse

| Practice | Where |
|----------|-------|
| Generic error messages ("Invalid credentials", never "email not found") | All sign-in/OTP actions |
| Rate limit OTP requests per phone/email + IP | Supabase dashboard + edge middleware |
| Enable CAPTCHA on sign-up/OTP endpoints before public registration | Phase 5 launch requirement |
| Invite tokens: removed. Office sets username + password; reset is directory-only | `provisionMemberAction` / `resetMemberPasswordAction` |
| Family access: admission + DOB, rate-limited, read-only session | [family-access.md](./family-access.md) (Phase 1) |
| School admin registration requires official-domain email (block free providers in production; development accepts any inbox) | Phase 6 |

## Passwords and OTP

- Minimum 10-character passwords; no composition rules beyond that (NIST 800-63B guidance — length over complexity).
- OTP codes: 6 digits, short expiry (Supabase default), single-use, bounded verification attempts.
- Phone OTP: pick the SMS provider with the best India delivery rates (Twilio/MessageBird/Vonage are all supported by Supabase); log delivery failures — SMS is the flakiest channel.

## Passkeys

- Opt-in experimental flag stays until GA; pin `@supabase/supabase-js` version, watch the changelog before upgrades.
- Retry UX for `webauthn_challenge_expired` (biometric prompt timeout) — the most common production error.
- Passkeys are a complement to email/phone identity, never the only credential (users lose devices).

## Authorization (RBAC + tenancy)

| Practice | Enforcement point |
|----------|-------------------|
| Role checked server-side on every action, even when the menu is already filtered | `assertRole()` |
| RLS on every tenant table; policies re-validate membership, not just claims | SQL migrations, two-school isolation test |
| `platform_owner` console only via dedicated route group + re-verification of the global claim | Console layout server component |
| Every privileged mutation writes audit fields (`created_by`, `updated_by`) | DB defaults + action code |
| Membership removal takes effect immediately (RLS reads live data) | No session-revocation hacks needed |

## AI service (`apps/agent`)

- Service tokens: 60-second TTL, HS256 shared secret, `scope` claim per workflow — see [agent-auth.md](./agent-auth.md).
- Agent routes all `protected` except health check; Studio auth enabled in deployed environments.
- Rate-limit LLM workflows per school (cost firewall).
- `AGENT_SERVICE_SECRET` and LLM keys: server-only env, never `NEXT_PUBLIC_*`, never monorepo root `.env`.

## Secrets and configuration

- All secrets in per-app `.env.local` / deployment env vars; never committed (`.gitignore` covers them — verify before first push).
- Different values per environment (dev/pilot/prod Supabase projects); no production data in dev.
- Webhook endpoints (payments Phase 5, WhatsApp delivery Phase 2) verify provider signatures before processing.

## Launch checklists

**Before pilot (Phase 1):**

- [ ] `getUser()` everywhere, no `getSession()` (grep)
- [ ] Middleware protection verified for all `/[workspace]/*` routes
- [ ] RLS isolation test passes with two schools
- [ ] Generic auth errors; no enumeration
- [ ] Auth email templates branded (Supabase dashboard)

**Before public registration (Phase 5):**

- [ ] CAPTCHA on registration/OTP
- [ ] Rate limiting on all auth endpoints
- [ ] TOTP MFA enforced for `platform_owner`, offered to `school_admin`
- [ ] Security headers (CSP etc.) reviewed on the public site
- [ ] Incident runbook: how to disable a compromised school/account

## References

- [Supabase auth production checklist](https://supabase.com/docs/guides/auth/going-to-prod)
- [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) (password guidance)
- `.agents/skills/nextjs-supabase-auth` — validation checks this repo enforces
