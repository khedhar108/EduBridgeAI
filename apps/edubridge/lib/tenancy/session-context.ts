import { eq, getDb, schoolMembers, schools, type SchoolRole } from "@repo/db";
import { requireUser } from "../auth/get-user";

export type SessionContext = {
  userId: string;
  schoolId: string;
  schoolSlug: string;
  role: SchoolRole;
  email: string | undefined;
};

/**
 * Bootstrap only: resolve membership for a workspace slug.
 * All other tenant reads/writes go through withTenant().
 */
export async function getSessionContext(
  schoolSlug: string,
): Promise<SessionContext | null> {
  const user = await requireUser();
  if (!user) return null;

  const db = getDb();
  const rows = await db
    .select({
      schoolId: schools.id,
      schoolSlug: schools.slug,
      role: schoolMembers.role,
    })
    .from(schoolMembers)
    .innerJoin(schools, eq(schoolMembers.schoolId, schools.id))
    .where(eq(schoolMembers.userId, user.id));

  const match = rows.find((r) => r.schoolSlug === schoolSlug);
  if (!match) return null;

  return {
    userId: user.id,
    schoolId: match.schoolId,
    schoolSlug: match.schoolSlug,
    role: match.role as SchoolRole,
    email: user.email,
  };
}

export function assertRole(
  ctx: SessionContext,
  allowed: SchoolRole[],
): void {
  if (!allowed.includes(ctx.role)) {
    throw new Error("Forbidden");
  }
}

export async function listMembershipsForUser(userId: string) {
  const db = getDb();
  return db
    .select({
      schoolId: schools.id,
      schoolSlug: schools.slug,
      schoolName: schools.name,
      role: schoolMembers.role,
    })
    .from(schoolMembers)
    .innerJoin(schools, eq(schoolMembers.schoolId, schools.id))
    .where(eq(schoolMembers.userId, userId));
}
