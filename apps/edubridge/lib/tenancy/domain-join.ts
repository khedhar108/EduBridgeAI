import {
  and,
  eq,
  getDb,
  membershipRequests,
  profiles,
  schools,
} from "@repo/db";
import {
  emailDomain,
  isEligibleSchoolEmailDomain,
} from "./email-domain";

export type PendingDomainJoin = {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  requestId: string;
};

/**
 * If the user's email domain matches a school's official domain, ensure a
 * pending membership_requests row exists. Does not grant school_members.
 */
export async function ensureDomainJoinRequest(opts: {
  userId: string;
  email: string;
  fullName?: string;
  username?: string;
}): Promise<PendingDomainJoin | null> {
  const email = opts.email.toLowerCase();
  const domain = emailDomain(email);
  if (!domain || !isEligibleSchoolEmailDomain(domain)) {
    return null;
  }

  const db = getDb();
  const schoolRows = await db
    .select({
      id: schools.id,
      name: schools.name,
      slug: schools.slug,
    })
    .from(schools)
    .where(eq(schools.officialEmailDomain, domain))
    .limit(1);

  const school = schoolRows[0];
  if (!school) return null;

  const existingProfile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, opts.userId))
    .limit(1);

  if (!existingProfile[0]) {
    const name =
      opts.fullName?.trim() ||
      email.split("@")[0] ||
      "School member";
    await db.insert(profiles).values({
      id: opts.userId,
      fullName: name.length >= 2 ? name : "School member",
      email,
    });
  } else if (!opts.email) {
    await db
      .update(profiles)
      .set({ updatedAt: new Date() })
      .where(eq(profiles.id, opts.userId));
  }

  const pending = await db
    .select({ id: membershipRequests.id })
    .from(membershipRequests)
    .where(
      and(
        eq(membershipRequests.schoolId, school.id),
        eq(membershipRequests.userId, opts.userId),
        eq(membershipRequests.status, "pending"),
      ),
    )
    .limit(1);

  if (pending[0]) {
    return {
      schoolId: school.id,
      schoolName: school.name,
      schoolSlug: school.slug,
      requestId: pending[0].id,
    };
  }

  const inserted = await db
    .insert(membershipRequests)
    .values({
      schoolId: school.id,
      userId: opts.userId,
      email,
      username: opts.username,
      status: "pending",
    })
    .returning({ id: membershipRequests.id });

  return {
    schoolId: school.id,
    schoolName: school.name,
    schoolSlug: school.slug,
    requestId: inserted[0]!.id,
  };
}

export async function listPendingRequestsForUser(userId: string) {
  const db = getDb();
  return db
    .select({
      id: membershipRequests.id,
      schoolName: schools.name,
      schoolSlug: schools.slug,
      status: membershipRequests.status,
      createdAt: membershipRequests.createdAt,
    })
    .from(membershipRequests)
    .innerJoin(schools, eq(membershipRequests.schoolId, schools.id))
    .where(
      and(
        eq(membershipRequests.userId, userId),
        eq(membershipRequests.status, "pending"),
      ),
    );
}
