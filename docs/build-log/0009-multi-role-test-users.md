# 0009 — Multi-role test users

**Date:** 2026-08-08

## Goal

Seed EduDatabase Auth users so we can smoke-test school admin, teacher, and platform owner logins locally.

## What changed

- Pilot school already existed (`edubridge-pilot-bridge` / `pilot-school.edu`)
- Added Auth users + `profiles` + `school_members` (admin, teacher) and platform owner (`app_metadata.platform_owner`)
- Documented emails/password and test steps in `docs/guides/auth-local-vs-prod.md`
- Live smoke verified for all three levels (screenshots 2026-08-08)

## Test logins (password for all: `TestLogin123!`)

| Email | Role | Sign-in | Verified |
|-------|------|---------|----------|
| `admin@pilot-school.edu` | school_admin | `/sign-in` → `/edubridge-pilot-bridge` | [x] |
| `teacher@pilot-school.edu` | teacher | `/sign-in` → workspace | [x] |
| `owner@edubridge.app` | platform owner | `/platform/sign-in` → `/platform` | [x] |

## Commands

```bash
pnpm --filter edubridge dev
# open http://localhost:3000/sign-in
```

## Key paths

- `docs/guides/auth-local-vs-prod.md`
- `docs/roadmap/phase-0-foundation.md` (checkboxes)
- `docs/architecture/auth/family-access.md` (docs only — not testable yet)

## Next

Invite + domain activate smoke (later); shell chrome (0.4).
