import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import postgres from "postgres";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const migrationsDir = path.join(packageDir, "migrations");
const journalPath = path.join(migrationsDir, "meta", "_journal.json");
const schemaPath = path.join(packageDir, "src", "schema", "index.ts");
const cliSchemaPath = schemaPath.replaceAll("\\", "/");

const connectionString =
  process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Add it to packages/db/.env before running db:check.",
  );
}

const journal = JSON.parse(await readFile(journalPath, "utf8"));
const localMigrations = await Promise.all(
  journal.entries.map(async (entry) => {
    const sqlPath = path.join(migrationsDir, `${entry.tag}.sql`);
    const body = await readFile(sqlPath, "utf8");
    return {
      tag: entry.tag,
      createdAt: entry.when,
      hash: createHash("sha256").update(body).digest("hex"),
    };
  }),
);

const database = postgres(connectionString, { max: 1, prepare: false });

try {
  const applied = await database`
    select hash, created_at
    from drizzle.__drizzle_migrations
    order by created_at
  `;
  const appliedHashes = new Set(applied.map((row) => row.hash));
  const pending = localMigrations.filter(
    (migration) => !appliedHashes.has(migration.hash),
  );

  if (pending.length > 0) {
    throw new Error(
      `Pending database migrations: ${pending.map((item) => item.tag).join(", ")}. Review them, then ask permission before running pnpm db:migrate.`,
    );
  }
} finally {
  await database.end();
}

const tempRoot = await mkdtemp(path.join(tmpdir(), "edubridge-db-health-"));
const tempMigrations = path.join(tempRoot, "migrations");
const cliTempMigrations = tempMigrations.replaceAll("\\", "/");

try {
  await cp(migrationsDir, tempMigrations, { recursive: true });
  const beforeFiles = new Set(await readdir(tempMigrations));
  const drizzleKitBin = path.join(
    packageDir,
    "node_modules",
    "drizzle-kit",
    "bin.cjs",
  );
  const result = spawnSync(
    process.execPath,
    [
      drizzleKitBin,
      "generate",
      `--schema=${cliSchemaPath}`,
      `--out=${cliTempMigrations}`,
      "--dialect=postgresql",
      "--name=health-check",
      "--prefix=index",
    ],
    {
      cwd: packageDir,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Drizzle snapshot check failed:\n${result.stderr || result.stdout}`,
    );
  }

  const afterFiles = await readdir(tempMigrations);
  const generatedSql = afterFiles.find(
    (file) => file.endsWith(".sql") && !beforeFiles.has(file),
  );

  if (generatedSql) {
    throw new Error(
      "Schema changes are not generated yet. Run pnpm db:generate -- --name=<short-kebab-name>, review the SQL, and do not migrate without permission.",
    );
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

process.stdout.write(
  "Database health OK: schema snapshot and migration journal are current. No db:generate or db:migrate needed.\n",
);
process.exit(0);
