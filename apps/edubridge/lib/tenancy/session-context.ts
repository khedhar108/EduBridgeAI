import { and, eq, getDb, schoolMembers, schools, type SchoolRole } from "@repo/db";
import { requireUser } from "../auth/get-user";
import { getImpersonation } from "./impersonation";

export type SessionContext = {
  userId: string;
  schoolId: string;
  schoolSlug: string;
  role: SchoolRole;
  email: string | undefined;
  /** Present only when an admin is impersonating this user. */
  isImpersonating?: boolean;
  realUserId?: string;
  realEmail?: string;
};

/**
 * Bootstrap only: resolve membership for a workspace slug.
 * All other tenant reads/writes go through withTenant().
 *
 * Staff identity is Supabase `getUser()` + `school_members`. Family cookie
 * (`edubridge.family`) is never read here — a family HMAC cannot open Team
 * or Fees. Impersonation still requires a live admin Supabase session.
 *
 * When a valid impersonation cookie exists, the real auth user (admin) is
 * verified as an active admin of this school, then the context is swapped to
 * the target member. RLS claims in withTenant follow the swapped identity.
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
      isActive: schoolMembers.isActive,
      archivedAt: schoolMembers.archivedAt,
    })
    .from(schoolMembers)
    .innerJoin(schools, eq(schoolMembers.schoolId, schools.id))
    .where(eq(schoolMembers.userId, user.id));

  const match = rows.find((r) => r.schoolSlug === schoolSlug);
  if (!match || !match.isActive || match.archivedAt) return null;

  // Impersonation: admin views as a target member of the same school.
  const impersonation = await getImpersonation();
  if (impersonation && impersonation.schoolId === match.schoolId) {
    if (match.role !== "school_admin") return null;

    const targetRows = await db
      .select({
        role: schoolMembers.role,
        isActive: schoolMembers.isActive,
        archivedAt: schoolMembers.archivedAt,
      })
      .from(schoolMembers)
      .where(
        and(
          eq(schoolMembers.schoolId, match.schoolId),
          eq(schoolMembers.userId, impersonation.targetUserId),
        ),
      )
      .limit(1);

    const target = targetRows[0];
    if (!target || !target.isActive || target.archivedAt) return null;
    if (target.role === "school_admin") {
      return null;
    }

    return {
      userId: impersonation.targetUserId,
      schoolId: match.schoolId,
      schoolSlug: match.schoolSlug,
      role: target.role as SchoolRole,
      email: impersonation.targetEmail ?? undefined,
      isImpersonating: true,
      realUserId: user.id,
      realEmail: user.email,
    };
  }

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

export type InactiveMembership = {
  schoolId: string;
  schoolSlug: string;
  schoolName: string;
  role: SchoolRole;
  archived: boolean;
};

/**
 * Distinguish "inactive member" from "no membership" so the workspace can
 * render a friendly "contact your admin" message instead of a bare 404.
 * Reads the real auth user's membership directly (not impersonation).
 */
export async function getInactiveMembership(
  schoolSlug: string,
): Promise<InactiveMembership | null> {
  const user = await requireUser();
  if (!user) return null;

  const db = getDb();
  const rows = await db
    .select({
      schoolId: schools.id,
      schoolSlug: schools.slug,
      schoolName: schools.name,
      role: schoolMembers.role,
      isActive: schoolMembers.isActive,
      archivedAt: schoolMembers.archivedAt,
    })
    .from(schoolMembers)
    .innerJoin(schools, eq(schoolMembers.schoolId, schools.id))
    .where(
      and(eq(schoolMembers.userId, user.id), eq(schools.slug, schoolSlug)),
    )
    .limit(1);

  const match = rows[0];
  if (!match) return null;
  const archived = match.archivedAt !== null;
  if (match.isActive && !archived) return null;

  return {
    schoolId: match.schoolId,
    schoolSlug: match.schoolSlug,
    schoolName: match.schoolName,
    role: match.role as SchoolRole,
    archived,
  };
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
