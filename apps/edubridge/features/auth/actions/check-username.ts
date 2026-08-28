"use server";

import { and, eq, getDb, schoolMembers, schools } from "@repo/db";
import { validateUsername } from "../lib/username";

export type UsernameCheck = {
  available: boolean;
  reason?: string;
};

/**
 * Single-query per-school availability check. Username is unique within
 * (school_id, username), not globally — the same handle can exist in
 * different schools. One SELECT against the partial unique index.
 */
export async function checkUsernameAction(
  username: string,
  schoolSlug: string,
): Promise<UsernameCheck> {
  const value = username.trim().toLowerCase();

  const error = validateUsername(value);
  if (error) {
    return { available: false, reason: error };
  }

  if (!schoolSlug) {
    return { available: false, reason: "School is required to check username." };
  }

  const db = getDb();
  const rows = await db
    .select({ id: schoolMembers.userId })
    .from(schoolMembers)
    .innerJoin(schools, eq(schoolMembers.schoolId, schools.id))
    .where(
      and(
        eq(schoolMembers.username, value),
        eq(schools.slug, schoolSlug.toLowerCase()),
      ),
    )
    .limit(1);

  return rows.length === 0
    ? { available: true }
    : { available: false, reason: "That username is already taken in this school." };
}
