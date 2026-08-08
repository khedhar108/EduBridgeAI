import { sql } from "drizzle-orm";
import { getDb, type Db } from "./client";
import type { SchoolRole } from "./schema";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export interface TenantClaims {
  /** Auth user id (maps to auth.uid() expectations). */
  sub: string;
  /** Resolved tenant school id. */
  school_id: string;
  /** !Important: Membership role, useful to app guards but never trusted by RLS. */
  role: SchoolRole;
}

/**
 * Run tenant-scoped work inside a transaction with JWT claims set for RLS.
 *
 * The pool connects as the privileged `postgres` role, which bypasses RLS.
 * Switching locally to `authenticated` is therefore mandatory before queries.
 * Policies re-check `school_members`; they do not trust the supplied role claim.
 */
export function withTenant<T>(
  claims: TenantClaims,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return getDb().transaction(async (tx) => {
    const jwtClaims = {
      sub: claims.sub,
      role: "authenticated",
      school_id: claims.school_id,
      school_role: claims.role,
    };

    await tx.execute(
      sql`select set_config('request.jwt.claims', ${JSON.stringify(jwtClaims)}, true)`,
    );
    await tx.execute(sql`set local role authenticated`);
    return fn(tx);
  });
}
