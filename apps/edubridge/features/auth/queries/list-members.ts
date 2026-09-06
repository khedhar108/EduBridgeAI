import { eq, schoolMembers, profiles, type TenantTx } from "@repo/db";

export type MemberDirectoryEntry = {
  userId: string;
  fullName: string;
  email: string | null;
  username: string | null;
  role: string;
  isActive: boolean;
  archivedAt: Date | null;
  createdAt: Date;
};

/**
 * List all members of a school with their profile data for the admin
 * dashboard directory. Runs inside `withTenant` — RLS limits to the
 * caller's school. Includes inactive and archived rows for audit.
 */
export async function listSchoolMembers(
  tx: TenantTx,
  schoolId: string,
): Promise<MemberDirectoryEntry[]> {
  const rows = await tx
    .select({
      userId: schoolMembers.userId,
      role: schoolMembers.role,
      isActive: schoolMembers.isActive,
      archivedAt: schoolMembers.archivedAt,
      memberCreatedAt: schoolMembers.createdAt,
      fullName: profiles.fullName,
      email: profiles.email,
      username: schoolMembers.username,
    })
    .from(schoolMembers)
    .innerJoin(profiles, eq(schoolMembers.userId, profiles.id))
    .where(eq(schoolMembers.schoolId, schoolId))
    .orderBy(schoolMembers.createdAt);

  return rows.map((r) => ({
    userId: r.userId,
    fullName: r.fullName,
    email: r.email ?? null,
    username: r.username ?? null,
    role: r.role,
    isActive: r.isActive,
    archivedAt: r.archivedAt ?? null,
    createdAt: r.memberCreatedAt,
  }));
}
