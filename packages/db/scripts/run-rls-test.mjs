import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sqlFilePath = path.join(packageDir, "tests", "rls-isolation.sql");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Add it to packages/db/.env before running db:rls-test.",
  );
}

const sql = postgres(connectionString, { max: 1, prepare: false });

try {
  const sqlText = await readFile(sqlFilePath, "utf8");
  // Simple query protocol supports multi-statement files and surfaces
  // exceptions raised inside DO blocks. The file ends with `rollback;`,
  // so no fixture data persists regardless of pass/fail.
  await sql.unsafe(sqlText, { prepare: false }).simple();
  process.stdout.write(
    "RLS isolation test passed: Alpha user sees 1 school, 1 membership; cross-tenant update blocked. (rolled back)\n",
  );
} catch (error) {
  const message = error.message ?? String(error);
  if (/RLS failure/i.test(message)) {
    process.stderr.write(`RLS isolation test FAILED: ${message}\n`);
  } else {
    process.stderr.write(`RLS isolation test errored: ${message}\n`);
  }
  process.exit(1);
} finally {
  await sql.end();
}
