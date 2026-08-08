import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config for @repo/db.
 * CLI commands prefer MIGRATION_DATABASE_URL (session pooler :5432, supports
 * prepared statements + DDL) and fall back to DATABASE_URL (transaction
 * pooler :6543) so a single URL still works everywhere.
 */
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
