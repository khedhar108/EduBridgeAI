# Build log

Short chronological journal of how EduBridge was built. Read this when you need “what did we do and which commands,” not full architecture (that lives under `docs/architecture/`).

## How to write an entry

1. Next number: `NNNN-short-slug.md` (4-digit, zero-padded).
2. Fill the template below (keep it short — a few bullets and a few commands).
3. Add a row to the **Index** table in this file in the same change.

Agents: follow `.cursor/rules/50-build-log.mdc`.

### Entry template

```markdown
# NNNN — Title

**Date:** YYYY-MM-DD

## Goal

One line.

## What changed

- Bullet
- Bullet

## Commands

\`\`\`bash
pnpm …
\`\`\`

## Key paths

- `path/one`
- `path/two`

## Next

One line.
```

## Index

| #    | Entry                                                           | Date       | Summary                                                             |
| ---- | --------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| 0001 | [Pre–Phase 0 bootstrap](./0001-pre-phase0-bootstrap.md)         | 2026-08-06 | Build log + plan for `@repo/db` and `apps/edubridge`                |
| 0002 | [`@repo/db` + `apps/edubridge`](./0002-db-and-edubridge-app.md) | 2026-08-06 | Drizzle package + primary app scaffold; web demo → :3002            |
| 0003 | [Phase 0 core database](./0003-phase0-core-database.md)         | 2026-08-07 | Core schema + RLS + pilot seed + `/db-check` prepared locally       |
| 0004 | [Database workflow](./0004-database-workflow.md)                | 2026-08-07 | Canonical DB workflow guide, CLI env split, home `/db-check` button |
| 0005 | [Phase 0.1–0.2 verified on dev](./0005-phase0-db-verified.md)   | 2026-08-08 | Migrate + seed on EduDatabase; phase doc checkmarks updated         |
| 0006 | [SaaS boundary docs](./0006-saas-boundary-docs.md)              | 2026-08-08 | Platform/tenant/support contexts, folders, ADR-006 subdomains       |
| 0007 | [Auth + invitations](./0007-auth-invitations.md)                | 2026-08-08 | Sign-in surfaces, invitations table/flow, Phase 0 checkbox sync     |
| 0008 | [Domain join pending](./0008-domain-join-pending.md)            | 2026-08-08 | School-domain pending queue; admin activate on team dashboard       |
| 0009 | [Multi-role test users](./0009-multi-role-test-users.md)        | 2026-08-08 | Seeded admin/teacher/owner logins; how to start multi-role testing  |
| 0010 | [Git bootstrap first push](./0010-git-bootstrap-first-push.md)  | 2026-08-08 | First commit; `main` + `development` on GitHub; git workflow docs     |
| 0011 | [Workspace shell chrome](./0011-shell-chrome.md)                | 2026-08-08 | Phase 0.4 docs, skills, adaptive header shell on workspace routes       |
| 0012 | [Canvas UI particle + 3D object](./0012-canvas-ui-particle-object.md) | 2026-08-09 | Particle-scroll page shell + ParticleObject brand mark on `/` |
| 0013 | [Accountant + fee ledger](./0013-accountant-fee-ledger.md) | 2026-08-11 | `accountant` role, versioned fees, register/collect/audit UI |
| 0014 | [Phase 0 exit](./0014-phase0-exit.md) | 2026-08-15 | `db:rls-test` runner green, ADR-007 recorded, second school seeded |
| 0015 | [Auth shell + feral-blob mascot](./0015-auth-shell-blob.md) | 2026-08-23 | Split-screen auth layout, form-reactive mascot, docs audit fixes |
| 0016 | [RBAC dashboard + admin access controls](./0016-rbac-dashboard-admin-controls.md) | 2026-08-26 | coordinator role, capabilities, impersonation, member activation, username login, platform console, 2-school seed |
| 0017 | [Global 404, error boundaries, and health checks](./0017-error-404-health-checks.md) | 2026-08-27 | Global 404 + animated screen, error boundaries, `lib/http.ts`, `/api/health`, dev `/status` dashboard |
| 0018 | [Member archive + role change](./0018-member-archive.md) | 2026-08-28 | Terminal archive (no hard delete), admin archive/role-change, staff-directory controls |
| 0019 | [Family proof (match + cookie)](./0019-family-proof.md) | 2026-08-28 | Headless admission+DOB match, HMAC family cookie, isolated from staff session |
| 0020 | [Staff workspace sign-in](./0020-staff-workspace-signin.md) | 2026-08-28 | `/{slug}/sign-in` door; username from URL slug; proxy family paths public |
| 0021 | [Family entry form](./0021-family-entry-form.md) | 2026-08-28 | `/{slug}/family` admission+DOB form; two-door docs |
| 0022 | [Family home chrome](./0022-family-home-chrome.md) | 2026-08-28 | FamilyShell + `/{slug}/family/home`; cookie still not staff |
| 0023 | [Family hub pages](./0023-family-hub-pages.md) | 2026-08-28 | Home hub + Fees/Progress/Exams/Events under `/family/*` |
| 0024 | [Family parent wrapper](./0024-family-parent-wrapper.md) | 2026-08-28 | `parent_links` sibling group + Add child + switcher |
| 0025 | [Office-created staff accounts](./0025-office-staff-accounts.md) | 2026-08-28 | Directory Add member + reset password; invite tokens removed |
| 0026 | [School students dashboard](./0026-school-students.md) | 2026-08-28 | `0010` academic tables, `/students` attendance, family fills |
| 0028 | [Control Hub capability overrides](./0028-control-hub-overrides.md) | 2026-08-29 | `schools.capability_overrides`; Hub Switches persist on EduDatabase |
| 0029 | [Visual fee structures](./0029-visual-fee-structures.md) | 2026-08-29 | Visual heads studio, version timeline, Hub-aware Fees nav |
| 0030 | [Coordinator fee SELECT + demo flag](./0030-fee-select-coordinator.md) | 2026-08-29 | Fee SELECT includes coordinator; `is_demo`; Hub `fees.view` live |
| 0030 | [Public school registration](./0030-school-registration.md) | 2026-08-29 | `/register` wizard, instant school + first admin, founder password recovery |
| 0031 | [Workspace URL architecture](./0031-workspace-url-architecture.md) | 2026-08-29 | Dual-mode URL doc + open platform-launch checkboxes; no routing change |
| 0032 | [Host rewrite + Coolify path](./0032-host-rewrite-coolify.md) | 2026-08-29 | `proxy.ts` subdomain rewrite; admin School URL; Coolify+Hetzner HITL |
| 0033 | [Deployment env + GHCR](./0033-deployment-environments.md) | 2026-08-29 | NODE_ENV ownership, `*.dev.edubridge.app`, standalone Docker, one CI/CD workflow |
| 0034 | [Mastra Coolify host](./0034-mastra-coolify-host.md) | 2026-08-30 | OSS agent on Coolify; not Mastra Cloud; grill closed |
