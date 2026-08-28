import { randomUUID } from "node:crypto";
import { and, desc, eq, getDb, parentLinks } from "@repo/db";
import { MAX_LINKED_STUDENTS } from "./family-session-token";

export { MAX_LINKED_STUDENTS };

export type ParentFamilyGroup = {
  familyId: string;
  studentIds: string[];
};

async function studentIdsForFamily(
  schoolId: string,
  familyId: string,
): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ studentId: parentLinks.studentId })
    .from(parentLinks)
    .where(
      and(
        eq(parentLinks.schoolId, schoolId),
        eq(parentLinks.familyId, familyId),
      ),
    )
    .orderBy(parentLinks.createdAt);

  return [...new Set(rows.map((row) => row.studentId))].slice(
    0,
    MAX_LINKED_STUDENTS,
  );
}

/**
 * Parent sign-in: reuse an existing sibling group for this child, or mint one.
 * Always constrained by `schoolId` from the slug match.
 */
export async function resolveParentFamilyGroup(
  schoolId: string,
  studentId: string,
): Promise<ParentFamilyGroup> {
  const db = getDb();
  const existing = await db
    .select({ familyId: parentLinks.familyId })
    .from(parentLinks)
    .where(
      and(
        eq(parentLinks.schoolId, schoolId),
        eq(parentLinks.studentId, studentId),
      ),
    )
    .orderBy(desc(parentLinks.createdAt))
    .limit(1);

  const familyId = existing[0]?.familyId ?? randomUUID();

  await db
    .insert(parentLinks)
    .values({ schoolId, familyId, studentId })
    .onConflictDoNothing();

  const studentIds = await studentIdsForFamily(schoolId, familyId);
  return { familyId, studentIds };
}

export type LinkStudentResult =
  | { ok: true; familyId: string; studentIds: string[] }
  | { ok: false; reason: "full" | "cross_school" };

/**
 * Add a matched child to this parent's group. Caller already proved admission+DOB.
 */
export async function linkStudentToFamilyGroup(
  schoolId: string,
  familyId: string,
  studentId: string,
): Promise<LinkStudentResult> {
  const current = await studentIdsForFamily(schoolId, familyId);
  if (current.includes(studentId)) {
    return { ok: true, familyId, studentIds: current };
  }
  if (current.length >= MAX_LINKED_STUDENTS) {
    return { ok: false, reason: "full" };
  }

  const db = getDb();
  await db.insert(parentLinks).values({ schoolId, familyId, studentId });
  const studentIds = await studentIdsForFamily(schoolId, familyId);
  return { ok: true, familyId, studentIds };
}
