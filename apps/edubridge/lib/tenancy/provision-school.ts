import {
  adminAuditEvents,
  eq,
  getDb,
  profiles,
  schoolMembers,
  schools,
} from "@repo/db";
import type { User } from "@supabase/supabase-js";
import {
  createAdminClientForUserUpdate,
  AdminAuthUnavailableError,
} from "@/lib/auth/supabase-admin";
import {
  PENDING_SCHOOL_META_KEY,
  parsePendingSchool,
  type PendingSchoolRegistration,
} from "./pending-school";
import { listMembershipsForUser } from "./session-context";
import { workspaceSlugError } from "./school-slug";

export type ProvisionSchoolResult =
  | { ok: true; slug: string; schoolId: string }
  | { ok: false; error: string };

async function clearPendingMetadata(userId: string): Promise<void> {
  try {
    const admin = createAdminClientForUserUpdate();
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { [PENDING_SCHOOL_META_KEY]: null },
    });
  } catch (err) {
    if (err instanceof AdminAuthUnavailableError) return;
    console.error("clearPendingMetadata failed", err);
  }
}

/**
 * Create school + first school_admin from pending signup metadata.
 * Idempotent: existing membership wins. Uses privileged getDb() because
 * authenticated has no INSERT on schools (RLS).
 */
export async function provisionSchoolForUser(input: {
  userId: string;
  email: string;
  pending: PendingSchoolRegistration;
}): Promise<ProvisionSchoolResult> {
  const slugError = workspaceSlugError(input.pending.slug);
  if (slugError) return { ok: false, error: slugError };

  const existing = await listMembershipsForUser(input.userId);
  const active = existing[0];
  if (active) {
    await clearPendingMetadata(input.userId);
    return { ok: true, slug: active.schoolSlug, schoolId: active.schoolId };
  }

  const email = input.email.toLowerCase();
  const domain = email.slice(email.lastIndexOf("@") + 1);
  const db = getDb();

  try {
    const created = await db.transaction(async (tx) => {
      const [school] = await tx
        .insert(schools)
        .values({
          name: input.pending.name,
          slug: input.pending.slug,
          officialEmailDomain: domain,
          country: input.pending.country,
          state: input.pending.state,
          city: input.pending.city,
          pincode: input.pending.pincode,
        })
        .returning({ id: schools.id, slug: schools.slug });
      if (!school) throw new Error("SCHOOL_INSERT_FAILED");

      await tx
        .insert(profiles)
        .values({
          id: input.userId,
          fullName: input.pending.fullName,
          email,
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: {
            fullName: input.pending.fullName,
            email,
            updatedAt: new Date(),
          },
        });

      await tx.insert(schoolMembers).values({
        schoolId: school.id,
        userId: input.userId,
        role: "school_admin",
        username: input.pending.username,
      });

      await tx.insert(adminAuditEvents).values({
        schoolId: school.id,
        actorId: input.userId,
        action: "school.provision",
        entityType: "school",
        entityId: school.id,
        targetUserId: input.userId,
        detail: {
          slug: school.slug,
          state: input.pending.state,
          city: input.pending.city,
        },
      });

      return school;
    });

    await clearPendingMetadata(input.userId);
    return { ok: true, slug: created.slug, schoolId: created.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("schools_slug_unique")) {
      return {
        ok: false,
        error: "That workspace name is taken. Go back and pick another.",
      };
    }
    if (message.includes("schools_official_email_domain_unique")) {
      return {
        ok: false,
        error:
          "A school is already registered for that email domain. Sign in or request access.",
      };
    }
    if (message.includes("school_members_school_username_unique")) {
      return { ok: false, error: "That username is taken. Pick another." };
    }
    console.error("provisionSchoolForUser failed", err);
    return { ok: false, error: "Could not create the school. Try again." };
  }
}

/** After email confirm / OTP / magic link — provision if metadata is present. */
export async function tryProvisionPendingSchool(
  user: User,
): Promise<ProvisionSchoolResult | null> {
  const pending = parsePendingSchool(user.user_metadata);
  if (!pending || !user.email) return null;

  return provisionSchoolForUser({
    userId: user.id,
    email: user.email,
    pending,
  });
}

export async function schoolSlugTaken(slug: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);
  return Boolean(rows[0]);
}

export async function schoolDomainTaken(domain: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.officialEmailDomain, domain.toLowerCase()))
    .limit(1);
  return Boolean(rows[0]);
}
