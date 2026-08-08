import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: Db | undefined;

/**
 * Server-only Drizzle client.
 * Use the Supabase transaction-mode pooler (:6543) and `prepare: false`.
 */
export function getDb(): Db {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Use the Supabase transaction pooler (port 6543) with prepare: false.",
    );
  }

  client = postgres(connectionString, { prepare: false });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

/** Alias used in architecture docs — same as getDb(). */
export function db(): Db {
  return getDb();
}

/** Close the pool in one-shot scripts (seed, maintenance, tests). */
export async function closeDb(): Promise<void> {
  if (!client) {
    return;
  }

  await client.end({ timeout: 5 });
  client = undefined;
  dbInstance = undefined;
}
