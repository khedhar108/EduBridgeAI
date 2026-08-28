import { getDb, sql } from "@repo/db";

export type HealthCheckResult = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

const DB_CHECK_TIMEOUT_MS = 3_000;

/**
 * Lightweight database reachability check ("back end → database").
 * Runs `select 1` on the shared Drizzle pool and measures round-trip latency.
 * The `error` detail is only surfaced outside production.
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const started = performance.now();

  try {
    await Promise.race([
      getDb().execute(sql`select 1`),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Database health check timed out.")),
          DB_CHECK_TIMEOUT_MS,
        ),
      ),
    ]);

    return { ok: true, latencyMs: Math.round(performance.now() - started) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database check failed.";
    const detail = process.env.NODE_ENV === "production" ? undefined : message;

    return {
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      ...(detail ? { error: detail } : {}),
    };
  }
}
