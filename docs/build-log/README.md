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
