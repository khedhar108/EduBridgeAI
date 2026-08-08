# Auth: local test vs production (Phase 0)

Supabase Auth + Postgres is the same project for local Next and “prod-like” flows right now — your app on `localhost:3000` talks to **EduDatabase**. Difference is mostly **URLs and how you create the first admin**.

## Three ways people get in

| Path | Who | What |
|------|-----|------|
| **Staff sign-in** | Teachers, staff, school admin | Email + password (`/sign-in`). Domain join or invite first. |
| **Invite** | Anyone admin picks (often Gmail / guest staff) | One-time link with a **fixed role** → active `school_members` immediately. **Not** for thousands of students. |
| **Family (admission + DOB)** | Parents **and** students | `/[workspace]/family` — read-only session; parent multi-child wrapper. See [family-access.md](../architecture/auth/family-access.md). **Phase 1** (needs `students` table). |

## Invite = what?

Admin sends a **one-time link** with a role already chosen. For **staff** (and rare edge cases) — not the primary path for parents/students.

## Domain join = what?

Email ends with the school’s `official_email_domain` → staff request access → **pending** until admin **Activate** on Team.

## Family = what?

Admission number + student DOB → read-only family cookie. No mass passwords. Parents add siblings in one session.

## Same in local and production (staff)

| Piece | Behavior |
|-------|----------|
| Auth users | Supabase Auth (staff) |
| Membership | `school_members` only (RLS) |
| Invite | `invitations` → `/accept-invite/<token>` |
| Domain queue | `membership_requests` → Team activate |
| Pilot school | slug `edubridge-pilot-bridge`, domain `pilot-school.edu` |

## Different local vs production

| | Local (now) | Production (later) |
|--|-------------|-------------------|
| App URL | `http://localhost:3000` | `https://…` / `*.edubridge.app` |
| Invite link host | `localhost:3000` (or set `NEXT_PUBLIC_APP_URL`) | Real public origin |
| First admin | Manual (below) | School registration (Phase 6) creates admin |
| Email delivery | Copy invite URL from Team UI | Send email (not built yet) |
| Host routing | Path `/edubridge-pilot-bridge` | Subdomain rewrite (ADR-006) |
| Family entry | Phase 1: `/edubridge-pilot-bridge/family` | Same path on workspace host |

## Ready-to-use test logins (EduDatabase)

Seeded in Supabase Auth + `profiles` / `school_members`.

**Password (all three accounts):** `TestLogin123!`

| Email | Password | Role | Where to sign in | Lands on | Verified |
|-------|----------|------|------------------|----------|----------|
| `admin@pilot-school.edu` | `TestLogin123!` | school_admin | `/sign-in` | `/edubridge-pilot-bridge` | [x] |
| `teacher@pilot-school.edu` | `TestLogin123!` | teacher | `/sign-in` | `/edubridge-pilot-bridge` | [x] |
| `owner@edubridge.app` | `TestLogin123!` | platform owner (`app_metadata`) | `/platform/sign-in` | `/platform` | [x] |

Live check (2026-08-08): workspace shows role badge + email; platform console shows Phase 0 placeholder.

### Verified so far

- [x] Teacher login
- [x] School admin login
- [x] Platform owner login
- [ ] Invite outsider path (do later)
- [ ] Domain join → activate (do later)
- [ ] Family admission + DOB (Phase 1)
- [ ] New school registration (Phase 6)

Pilot school already exists: slug `edubridge-pilot-bridge`, domain `pilot-school.edu`.

```bash
pnpm --filter edubridge dev
```

### New staff on existing school

1. As admin → `/edubridge-pilot-bridge/settings/team`
2. **Invite** a Gmail (outsider) **or** ask them to `/join-school` with `*@pilot-school.edu`
3. Domain path: pending until admin **Activate**

### Brand-new school (first-time registration)

**Not built yet** (Phase 6). Today you cannot self-register a school in the app. Only the seeded pilot school exists until Phase 6 registration ships.

### Family (parent/student admission + DOB)

**Not built yet** (Phase 1). No student rows / `/family` UI to test.

### Extra: invite outsider / domain pending

1. As admin → Team → Invite (e.g. Gmail) → copy link → incognito accept  
2. Or `/join-school` with `someone@pilot-school.edu` → admin Activate  

Gmail cannot domain-join.

## Env checklist (local)

`apps/edubridge/.env.local` needs:

- `DATABASE_URL` (pooler)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- optional: `NEXT_PUBLIC_APP_URL=http://localhost:3000` (invite link host)

Migrations on DB: `0000`, `0001` invitations, `0002` membership_requests. Auth test users seeded in EduDatabase (see table above).
