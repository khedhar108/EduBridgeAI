# Database workflow

The one document to read before touching any table. Canonical rules: [`docs/architecture/data-access.md`](../architecture/data-access.md) + [`multi-tenancy.md`](../architecture/multi-tenancy.md).

## Connection strings (read once)

**One Supabase database.** The URLs differ by **port / pooler mode**, not by project.

| Variable                 | Port                          | Who uses it                                        | Required?                             |
| ------------------------ | ----------------------------- | -------------------------------------------------- | ------------------------------------- |
| `DATABASE_URL`           | **6543** (transaction pooler) | Next.js app, seed, all runtime Drizzle queries     | **Yes**                               |
| `MIGRATION_DATABASE_URL` | **5432** (session pooler)     | `pnpm db:migrate`, `db:generate`, `db:studio` only | **No** — falls back to `DATABASE_URL` |

Why two poolers? Supabase exposes the same Postgres through different poolers:

- **6543 transaction mode** — built for serverless / many short queries. Our app connects with `prepare: false` (required for this mode).
- **5432 session mode** — safer for schema tools (DDL). Some drizzle-kit commands behave better here.

**Start with only `DATABASE_URL`.** Leave `MIGRATION_DATABASE_URL` commented out. Uncomment it only if `pnpm db:migrate` errors against `:6543`.

### Why `DATABASE_URL` appears in two files

Same value, two places — not two databases:

| File                        | Read by                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| `packages/db/.env`          | Root DB commands: `pnpm db:migrate`, `pnpm seed:dev`, `pnpm db:generate` |
| `apps/edubridge/.env.local` | Next.js at runtime (`/db-check`, server components)                      |

Node does not share env across packages. Copy the **same** `:6543` URL into both when developing locally.

**Production:** hosting platform gets `DATABASE_URL` (`:6543`). CI/release step may set `MIGRATION_DATABASE_URL` (`:5432`) for `pnpm db:migrate` only — optional if migrate works on `:6543`.

## Where things live

| Thing                                  | Path                                                                      | Committed?     |
| -------------------------------------- | ------------------------------------------------------------------------- | -------------- |
| Schema source of truth                 | `packages/db/src/schema/*.ts` (one file per domain, barrel in `index.ts`) | Yes            |
| Generated + hand-reviewed migrations   | `packages/db/migrations/`                                                 | Yes            |
| RLS policies, grants, helper functions | appended inside the same migration SQL file                               | Yes            |
| Dev seed                               | `packages/db/src/seed.ts`                                                 | Yes            |
| RLS isolation test                     | `packages/db/tests/rls-isolation.sql`                                     | Yes            |
| Local connection strings               | `packages/db/.env` + `apps/edubridge/.env.local` (same `DATABASE_URL`)    | **No — never** |

Rule: schema changes happen **only** by editing `packages/db/src/schema/*.ts`, then generating a migration. Never hand-edit tables in the Supabase dashboard — that creates drift the next migration will fight.

## The daily commands (from repo root)

```bash
# 1. Edit packages/db/src/schema/<table>.ts

# 2. Generate migration (SQL written to packages/db/migrations/)
pnpm db:generate -- --name=<short-change-name>

# 3. Review the generated SQL. Append RLS/grants/Auth-FK SQL yourself —
#    drizzle-kit does not generate those (see existing 0000_phase0_core.sql).

# 4. Apply to the database your packages/db/.env points at
pnpm db:migrate

# 5. Dev seed (idempotent, blocked in production)
pnpm seed:dev

# 6. Verify
pnpm lint && pnpm check-types && pnpm build
```

Migration state lives in the database (`__drizzle_migrations` table). `db:migrate` applies only pending files, in order. There is no force-push — if a migration fails, fix the SQL in the file and re-run; the failed statement rolls back, nothing half-applies.

`pnpm db:push` exists (drizzle-kit push) for throwaway scratch databases only. Never on a shared or production database — it skips migration files, so history is lost.

## NOT NULL on an existing table (the Prisma pain point)

Postgres refuses a `NOT NULL` column on rows that already exist. Two safe patterns — pick one, never "force":

1. **Add with a default** — Drizzle emits `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT 'x'`; Postgres backfills instantly.
2. **Nullable first, tighten later** — add nullable, backfill rows via the seed or a data migration, then a follow-up migration flips to `.notNull()`.

Changing a column type or dropping a column: write a new migration that does it explicitly (drizzle-kit will generate the alter; you review it). Destructive changes are always a deliberate SQL review, never a prompt you have to override.

## Dev vs production connections

See **Connection strings** above. Summary:

- **Dev:** both local env files point at your **dev** Supabase project (`:6543` URL).
- **Prod:** `DATABASE_URL` on the host only; never run `pnpm seed:dev` against prod.
- **Second Supabase project** (free tier) instead of branching — same workflow, swap URLs per environment.

## Production deploy

- `next build` never touches the database — builds are safe.
- Migrations run as a **separate release step**, not at app boot: set `DATABASE_URL` (and optionally `MIGRATION_DATABASE_URL`) in the host env (Vercel / Railway / GH Action), then run `pnpm db:migrate` before `pnpm start`. CI wiring lands when the deploy platform is chosen — the command is already root-level for that reason.
- `pnpm seed:dev` refuses to run with `NODE_ENV=production`.

## Don't pollute production with dummy data

Supabase branching (Pro plan) gives every PR its own database — the polished option. On the free plan, the standard practice is a **second Supabase project** (e.g. `edubridge-dev`): local `.env` points at it, seed and experiments live there, production `.env` only exists in the deploy host. Both options work with the same migration files — that is the point of keeping schema in git.

## Where to see the tables in Supabase

Dashboard → your project → **Table Editor** → schema `public`: `schools`, `profiles`, `school_members` (after `pnpm db:migrate`). Helper functions are under schema `private` (SQL Editor). Auth users: **Authentication → Users**.

## Vectors (Phase 2, not now)

When AI retrieval lands: one line in a migration — `create extension if not exists vector;` — then `PgVector` in `apps/agent`. Every vector carries `school_id` metadata and queries filter on it. Full design: [`docs/architecture/ai-rag.md`](../architecture/ai-rag.md). Nothing to prepare in the schema today.
