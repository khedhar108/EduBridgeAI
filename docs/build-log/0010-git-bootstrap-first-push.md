# 0010 — Git bootstrap and first GitHub push

**Date:** 2026-08-08

## Goal

Land the monorepo on GitHub with `main` (production) and `development` (staging) at the same initial commit, plus documented git/release workflow for the team.

## What changed

- First repository commit on `development` (full monorepo scaffold + Phase 0 work to date)
- `main` branch created at the same SHA for production deploys
- Remote `origin` → `github.com/khedhar108/EduBridgeAI`
- Git workflow: `.cursor/rules/50-git-workflow.mdc`, `.agents/skills/edubridge-git/`, `docs/guides/git-and-release-strategy.md`
- Root `.gitignore` blocks secrets, logs, `node_modules`, agent scratch (`.wayfinder/`, `one-person-ai/`)
- `CHANGELOG.md` started with `[Unreleased]` section

## Commands

```bash
git checkout development
git add -A
git commit -m "chore(repo): scaffold EduBridge monorepo"
git branch main
git remote add origin https://github.com/khedhar108/EduBridgeAI.git
git push -u origin main
git push -u origin development
```

## Key paths

- `docs/guides/git-and-release-strategy.md` — branch + PR + changelog playbook
- `.agents/skills/edubridge-git/SKILL.md` — agent skill (`/edubridge-git`)
- `.agents/skills/caveman-commit/SKILL.md` — commit message style (`/caveman-commit`)
- `docs/build-log/README.md` — append `0011-…` after the next milestone

## Next

- GitHub: set default branch to `main`; protect `main` and `development`
- Wire deploys: production ← `main`, staging ← `development`
- Day-to-day: `feature/<name>` → PR → `development` → test → PR → `main`
