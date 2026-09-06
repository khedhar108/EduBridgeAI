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
| `packages/db/.env`          | Root DB commands: `pnpm db:migrate`, `pnpm seed:dev`, `pnpm db:generate`, `pnpm db:studio` |
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
# 1. Edit packages/db/src/schema/<table>.ts  (schema is the source of truth)

# 2. Generate migration with a short kebab name
pnpm db:generate -- --name=<short-change-name>
# example: pnpm db:generate -- --name=add-fee-receipt-number

# 3. Open the new packages/db/migrations/000N_<name>.sql
#    - If it tries to CREATE tables/types that already exist → STOP. Do not migrate.
#      That means the snapshot is behind; fix meta snapshots first.
#    - Append RLS / grants yourself (drizzle-kit never writes those).

# 4. Ask the user for explicit permission, then apply pending migrations
pnpm db:migrate

# 5. Optional seed
pnpm seed:dev

# 6. Browse tables (Prisma Studio equivalent; same DB as localhost Next.js)
pnpm db:studio
# UI: https://local.drizzle.studio  — local server listens on :4983

# 7. Verify DB state without generating or migrating
pnpm db:check

# 7. Verify app health
pnpm lint
pnpm check-types
pnpm build
```

### Safety rules (so partial / duplicate migrations do not happen)

1. **Schema first.** Tables, columns, indexes, checks, FKs live only in `packages/db/src/schema/*.ts`. `db:generate` writes the SQL file **and** `migrations/meta/` snapshot. Never create those files by hand.
2. **Append RLS only.** After generate, you may append policies, grants, and helper functions. Never paste `CREATE TABLE` / `ALTER TABLE` / `CREATE INDEX` into an existing migration — that desyncs the snapshot; the next generate emits a duplicate (or a drop) and migrate fails.
3. **Missed a column or index?** Add it to schema and generate the **next** numbered file. Do not fold it into the previous SQL, even if that file is unapplied.
4. **Never `db:migrate` a file that recreates existing objects.** Review the SQL first.
5. Prefer `MIGRATION_DATABASE_URL` on the **session pooler `:5432`** for migrate/generate. Transaction pooler `:6543` can leave half-applied DDL when a statement fails.
6. **Always ask the user before running `pnpm db:migrate`.** Same for `db:generate` and schema edits.
7. Run `pnpm db:check` for a read-only answer. It checks current schema against the snapshot in a temporary folder and local migration hashes against `drizzle.__drizzle_migrations`.
8. If `pnpm db:check` says healthy, do not run generate or migrate.
9. Do **not** use `pnpm db:push` on shared/dev Supabase — it skips migration history.

Migration state lives in the database (`drizzle.__drizzle_migrations`). `db:migrate` applies only pending files, in order.


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
