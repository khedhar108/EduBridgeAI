---
name: edubridge-git
description: >
  EduBridge git workflow: Conventional Commits (caveman-commit style), branch
  strategy (main / development / feature / hotfix), staging vs production deploys,
  and PR merge rules. Use when the user asks to commit, write a commit message,
  open a PR, push, create a branch, release to main, or mentions git/branching/
  changelog. Also use whenever Cursor is about to run git commit on this repo.
---

# EduBridge Git

Canonical human doc: `docs/guides/git-and-release-strategy.md`.  
Cursor always-on mirror: `.cursor/rules/50-git-workflow.mdc`.  
Message compression: follow `.agents/skills/caveman-commit/SKILL.md` for subject/body shape.

## Branch model

```
feature/<name>  →  development  →  main
                      ↑ staging      ↑ production
```

| Branch | Purpose |
|--------|---------|
| `main` | Always deployable production. Deploy end-user environments from here only. |
| `development` | Integration branch. Staging / test URLs deploy from here. |
| `feature/<short-name>` | Single concern (e.g. `feature/phase-0-auth`). Branch from latest `development`. |
| `hotfix/<short-name>` | Urgent prod fix. Branch from `main`, PR into `main`, then merge/cherry-pick into `development`. |

Do not use `master`. Do not long-lived personal branches. Do not commit product features on `main`.

### Day-to-day

1. `git checkout development && git pull`
2. `git checkout -b feature/<short-name>`
3. Commit locally with Conventional Commits (below)
4. Push + open PR → `development`
5. After staging OK: PR `development` → `main` (release)

### Bootstrap (empty / first commit only)

One shared initial commit on `development`, create `main` at the same SHA, push both. No feature branch required for the scaffold dump. After that, use the flow above.

## Commit messages

Always use Conventional Commits + caveman-commit terseness.

```
<type>(<scope>): <imperative summary>

[optional body — why, not what]
```

**Types:** `feat` `fix` `refactor` `perf` `docs` `test` `chore` `build` `ci` `style` `revert`

**Scopes (prefer one):**

| Scope | Use for |
|-------|---------|
| `web` | `apps/web` app shell / cross-feature |
| `agent` | `apps/agent` Mastra |
| `docs` | `apps/docs` or `docs/` |
| `ui` | `packages/ui` |
| `ai-ui` | `packages/ai-ui` |
| `db` | schema, migrations, Drizzle, RLS |
| `auth` | sign-in, roles, invitations |
| `shell` | unified app shell / module registry |
| `student-dashboard` | Phase 1 module |
| `report-cards` | Phase 3 module |
| `test-papers` | Phase 4 module |
| `repo` | monorepo root tooling, gitignore, agents, rules |
| `ci` | pipelines / GitHub Actions |

**Rules:**

- Imperative: add / fix / remove — not added / fixes
- Subject ≤72 chars (aim ≤50), no trailing period
- Body only when why is non-obvious, or for BREAKING CHANGE / migrations / issue links
- Never: AI attribution lines, emoji (unless project later requires), “This commit…”, secrets in messages
- Breaking: `feat(scope)!: …` plus `BREAKING CHANGE:` body

**Examples:**

```
feat(auth): add school-scoped session claims

chore(repo): tighten gitignore for agent scratch

fix(shell): keep module pill in sync with route

docs(guides): add git and release strategy
```

## Staging hygiene

Never stage: `.env`, `.env.*` (except `*.example`), `*.log`, `node_modules`, `.pnpm-store*`, `.turbo`, `.next`, `.wayfinder/`, `.scratch/`, `*.pem`, `*.key`, local DB files.

Do stage when relevant: `.agents/`, `.cursor/rules/`, `AGENTS.md`, `skills-lock.json`, `*.env.example`.

## Pull requests

| PR | Merge style | Gate |
|----|-------------|------|
| `feature/*` → `development` | Squash and merge | CI green (`pnpm lint`, `check-types`, `build`) |
| `development` → `main` | Merge commit or squash — prefer one clear release commit/message | Staging verified |
| `hotfix/*` → `main` | Squash | CI green; then sync to `development` |

PR title ≈ intended squash subject. Body: summary + test plan.

## Changelog & releases

1. Keep root `CHANGELOG.md` ([Keep a Changelog](https://keepachangelog.com/)): move items from `[Unreleased]` into a versioned section when releasing `main`.
2. Optional: GitHub Release notes from the same bullets.
3. In-app “What’s new” for schools = product language only — not raw git subjects.

## Agent boundaries

- Only create commits / PRs / pushes when the user explicitly asks.
- Never `--force` on `main` / `development`, never `--no-verify`, never amend unless user rules allow.
- Prefer loading this skill + caveman-commit together when drafting the message; then run git per the user’s committing-changes rule.
