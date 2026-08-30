# Changelog

All notable changes to EduBridge are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).
Versioning follows [Semantic Versioning](https://semver.org/) once we cut public releases.

## [Unreleased]

### Added

- Deployment environment contract: Next.js owns `NODE_ENV`; `APP_ENV` is hostname-only; Vercel staging on `*.dev.edubridge.app`; Coolify pulls a prebuilt GHCR image on `main`
- Mastra host: second Coolify service (OSS `mastra start`), not Mastra Cloud ([ADR-010](docs/decisions/ADR-010-mastra-coolify-host.md))
- Git workflow guide, Cursor rule, and `edubridge-git` skill (Conventional Commits + main/development/feature flow)
- Root `.gitignore` tightened for logs, env secrets, and agent scratch while keeping `.agents/` and `.cursor/rules/` shareable
- First GitHub push (`main` + `development`); build log entry `0010-git-bootstrap-first-push`
