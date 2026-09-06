import { and, eq, getDb, isNull, schools, schoolMembers, students, sql } from "@repo/db";

export type SchoolOverview = {
  id: string;
  name: string;
  slug: string;
  officialEmailDomain: string;
  createdAt: Date;
  activeMemberCount: number;
  studentCount: number;
};

/**
 * Platform-console aggregate: all schools with active member + student counts.
 * Uses the privileged postgres connection (getDb) — the platform owner is not
 * a school member, so RLS would block tenant queries. The app layer
 * (getPlatformContext) gates access before this runs.
 */
export async function listSchoolsOverview(): Promise<SchoolOverview[]> {
  const db = getDb();
  const allSchools = await db
    .select()
    .from(schools)
    .orderBy(schools.createdAt);

  return Promise.all(
    allSchools.map(async (s) => {
      const [m] = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schoolMembers)
        .where(
          and(
            eq(schoolMembers.schoolId, s.id),
            eq(schoolMembers.isActive, true),
            isNull(schoolMembers.archivedAt),
          ),
        );

      const [st] = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(students)
        .where(eq(students.schoolId, s.id));

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        officialEmailDomain: s.officialEmailDomain,
        createdAt: s.createdAt,
        activeMemberCount: m?.c ?? 0,
        studentCount: st?.c ?? 0,
      };
    }),
  );
}
