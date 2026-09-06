# Auth: local test vs production (Phase 0)

Local Next may use the development Supabase project. Vercel staging must use a
separate non-production Supabase project, while Coolify production uses the
production project. Credentials and tenant data never cross those boundaries.

## Two ways people get in

| Path | Who | What |
|------|-----|------|
| **Staff sign-in** | Teachers, staff, school admin | Email + password, or username on `/{slug}/sign-in` (school from the URL). Global `/sign-in` still works (optional slug for username-from-bookmark). Office create or domain join first. |
| **Add member** | Anyone the office picks (often Gmail / guest staff) | Coordinator or admin sets username, email, password, and role in the staff directory → active `school_members` immediately. **Not** for thousands of students. |
| **Family (admission + DOB)** | Parents **and** students | `/[workspace]/family` — read-only session; parent multi-child wrapper. See [family-access.md](../architecture/auth/family-access.md). |

## Add member = what?

Office creates the account (name, email, username, password, role). The person signs in with what they were given. No link. For **staff** only — not the primary path for parents/students.

## Domain join = what?

Email ends with the school’s `official_email_domain` → staff request access → **pending** until admin **Activate** on Team.

## Family = what?

Admission number + student DOB → read-only family cookie. No mass passwords. Parents add siblings in one session.

## Same in local and production (staff)

| Piece | Behavior |
|-------|----------|
| Auth users | Supabase Auth (staff) |
| Membership | `school_members` only (RLS) |
| Add member | `auth.admin.createUser` + `profiles` + `school_members` |
| Domain queue | `membership_requests` → Team activate |
| Pilot school | slug `edubridge-pilot-bridge`, domain `pilot-school.edu` |

## Different local vs production

| | Local | Vercel staging | Coolify production |
|--|-------|----------------|--------------------|
| App URL | `http://localhost:3000/{slug}` or `{slug}.localhost:3000` | `https://{slug}.dev.edubridge.app` | `https://{slug}.edubridge.app` |
| Runtime | `NODE_ENV=development`, `APP_ENV=local` | `NODE_ENV=production`, `APP_ENV=staging` | `NODE_ENV=production`, `APP_ENV=production` |
| First admin | `/register` or seed | `/register` creates a synthetic-data admin | `/register` creates admin |
| Host routing | Path or `{slug}.localhost` | Staging subdomain rewrite | Production subdomain rewrite |
| Family cookie Path | Host-aware (`/{slug}/family` vs `/family`) | `/family` on school host | `/family` on school host |
| Email gate | Any valid domain | School/business domain required | School/business domain required |

Full table: [workspace-urls.md](../architecture/workspace-urls.md). Open slices: [platform-launch.md](../wayfinder/platform-launch.md).

## Ready-to-use test logins (EduDatabase)

Seeded in Supabase Auth + `profiles` / `school_members` via `pnpm seed:dev`.
The sign-in form accepts **email or username** (see
[admin-controls.md](../architecture/auth/admin-controls.md)).

**Password (all accounts):** `TestLogin123!`

| Email | Username | Role | Where to sign in | Lands on |
|-------|----------|------|------------------|----------|
| `admin@pilot-school.edu` | `pilot-admin` | school_admin | `/sign-in` | `/edubridge-pilot-bridge` |
| `coordinator@pilot-school.edu` | `pilot-coordinator` | coordinator | `/sign-in` | `/edubridge-pilot-bridge` |
| `accountant@pilot-school.edu` | `pilot-accountant` | accountant | `/sign-in` | `/edubridge-pilot-bridge` |
| `teacher@pilot-school.edu` | `pilot-teacher` | teacher | `/edubridge-pilot-bridge/sign-in` or `/sign-in` | `/edubridge-pilot-bridge` |
| `staff@pilot-school.edu` | `pilot-staff` | staff | `/sign-in` | `/edubridge-pilot-bridge` |
| `vikram@pilot-school.edu` | `pilot-vikram` | teacher | `/sign-in` | `/edubridge-pilot-bridge` |
| `meera@pilot-school.edu` | `pilot-meera` | teacher | `/sign-in` | `/edubridge-pilot-bridge` |
| `admin@oakwood.edu` | `oak-admin` | school_admin | `/sign-in` | `/oakwood-academy-bridge` |
| `teacher@oakwood.edu` | `oak-teacher` | teacher | `/sign-in` | `/oakwood-academy-bridge` |
| `owner@edubridge.app` | `platform-owner` | platform owner (`app_metadata`) | `/platform/sign-in` | `/platform` |

Also seeded: 50 students (Pilot, `EBS-2024-###`, Classes 6–10, Indian names,
primary guardians) + 15 students (Oakwood, `OAK-2024-###`) — visible on the
admin dashboard and in the platform console counts. Admin dashboard actions:
**Login as** (impersonation) and **Activate/Deactivate** per member.

Live check (2026-08-08): workspace shows role badge + email; platform console shows school aggregates. RBAC dashboard verified 2026-08-26.

### Verified so far

- [x] Teacher login
- [x] School admin login
- [x] Platform owner login
- [x] Family admission + DOB (local path cookie)
- [x] New school registration (`/register` thin slice)
- [ ] Add member outsider path (do later)
- [ ] Domain join → activate (do later)
- [ ] Family on `{slug}.edubridge.app` (platform-launch slice B DNS)

Pilot school already exists: slug `edubridge-pilot-bridge`, domain `pilot-school.edu`.

```bash
pnpm --filter edubridge dev
```

### New staff on existing school

1. As admin → `/edubridge-pilot-bridge` staff directory → **Add member**
2. Or ask them to `/join-school` with `*@pilot-school.edu`
3. Domain path: pending until admin **Activate**

### Brand-new school (first-time registration)

Public `/register` (Phase 6.1 thin slice). Production builds require a school or
business inbox (not Gmail/Yahoo/Outlook); local `pnpm dev` (`NODE_ENV=development`)
accepts any valid email. Vercel staging and Coolify production both use
`NODE_ENV=production` and the same inbox rules.

Production also needs, in the Supabase Auth dashboard:

- Redirect URLs including `https://<host>/auth/callback`
- `NEXT_PUBLIC_SITE_URL` on the app (email links)

Local: if email confirmations are off, `/register` provisions in the same request (no OTP).

### Family (parent/student admission + DOB)

Local: `/{slug}/sign-in` → Parent or student → `/{slug}/family/home`. Cookie Path follows Host ([workspace-urls.md](../architecture/workspace-urls.md)).

### Extra: add outsider / domain pending

1. As admin → directory → Add member (e.g. Gmail) → tell them the password  
2. Or `/join-school` with `someone@pilot-school.edu` → admin Activate  

Gmail cannot domain-join when `NODE_ENV=production`. Locally (`NODE_ENV=development`),
any email domain can join if it matches that school's official domain.

## Env checklist (local)

`apps/edubridge/.env.local` needs:

- Do **not** set `NODE_ENV` — `pnpm dev` sets `development`
- `APP_ENV=local` (optional locally; explicit is clearer)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `DATABASE_URL` (pooler)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required to add staff and reset passwords)

Migrations on DB: `0000` core, `0002` membership_requests, later fees/admin/archive. Auth test users seeded in EduDatabase (see table above). Drop `invitations` with `0011_drop-invitations` when permitted.

## Env checklist (Vercel staging / Coolify production)

Omit `NODE_ENV` on both platforms. Next’s production build already sets
`production`. Canonical table: [deployment-environments.md](../architecture/deployment-environments.md).

| | Vercel | Coolify |
|--|--------|---------|
| `APP_ENV` | `staging` | `production` |
| `WORKSPACE_ROOT_DOMAIN` | `dev.edubridge.app` | `edubridge.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://dev.edubridge.app` | `https://edubridge.app` |
| `NODE_ENV` | omit | omit |

HITL tickets: [Vercel staging](../wayfinder/tickets/task-vercel-project-and-env.md),
[Coolify](../wayfinder/tickets/task-coolify-hetzner.md).
