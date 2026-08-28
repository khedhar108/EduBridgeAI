import { eq, schoolMembers, profiles, type TenantTx } from "@repo/db";

export type MemberDirectoryEntry = {
  userId: string;
  fullName: string;
  email: string | null;
  username: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

/**
 * List all members of a school with their profile data for the admin
 * dashboard directory. Runs inside `withTenant` — RLS limits to the
 * caller's school.
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
    // email/username default to empty string for Auth FK PK safety
    email: r.email ?? null,
    username: r.username ?? null,
    role: r.role,
    isActive: r.isActive,
    createdAt: r.memberCreatedAt,
  }));
}
