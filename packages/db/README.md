# @repo/db

Shared **Drizzle ORM** package for EduBridge. Schema-as-code + connection factory used by product apps (`apps/edubridge`) and later by agent tools. Portable: change `DATABASE_URL` to move off Supabase Postgres.

## Layout

```
packages/db/
├── drizzle.config.ts
├── src/
│   ├── client.ts          # getDb() — transaction pooler, prepare: false
│   ├── rls.ts             # withTenant()
│   ├── schema/            # one file per table domain (barrel index)
│   ├── seed.ts            # idempotent pilot-school seed
│   └── index.ts
├── migrations/            # generated DDL + reviewed RLS SQL
└── tests/                 # rollback-only RLS isolation checks
```

## Env

Copy `.env.example` → `.env` (never commit secrets). Also copy the same
`DATABASE_URL` into `apps/edubridge/.env.local` — Next.js does not read this
folder.

| Variable                 | Port | Used by                        |
| ------------------------ | ---- | ------------------------------ |
| `DATABASE_URL`           | 6543 | App, seed, `getDb()`           |
| `MIGRATION_DATABASE_URL` | 5432 | drizzle-kit CLI only; optional |

Details: [`docs/guides/database-workflow.md`](../../docs/guides/database-workflow.md#connection-strings-read-once).

```bash
DATABASE_URL="postgresql://postgres.xzqxehyjkftzkllmgcwq:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
```

Mastra (`apps/agent`) should use **session/direct :5432**, not this URL. See `docs/architecture/mastra-supabase-database-architecture.md`.

Daily workflow (schema change → migration → seed → verify): [`docs/guides/database-workflow.md`](../../docs/guides/database-workflow.md).

## Scripts

```bash
pnpm --filter @repo/db check-types
pnpm db:generate   # schema/*.ts → new SQL + snapshot (then append RLS only)
pnpm db:migrate    # apply pending migration files
pnpm db:push       # scratch DBs only — skips migration history
pnpm db:studio
pnpm seed:dev      # idempotent, blocked when NODE_ENV=production
```

`db:migrate` and `seed:dev` target the database in `packages/db/.env`. Review
the generated migration before either command. The development seed upserts one
pilot school and is blocked when `NODE_ENV=production`.

After migration + seed, run `pnpm dev:edubridge` and open
`http://localhost:3000/db-check`. The probe is server-only and returns 404 in
production.

## Usage

```ts
import { withTenant } from "@repo/db";

await withTenant({ sub, school_id, role }, async (tx) => {
  // Tenant queries use tx; the wrapper activates RLS.
});
```
