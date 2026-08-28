"use server";

import { revalidatePath } from "next/cache";
import {
  adminAuditEvents,
  and,
  eq,
  getDb,
  profiles,
  schoolMembers,
  withTenant,
  type SchoolRole,
} from "@repo/db";
import { assertCapability } from "@/lib/auth/capabilities";
import {
  AdminAuthUnavailableError,
  createConfirmedAuthUser,
} from "@/lib/auth/supabase-admin";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { provisionMemberSchema } from "../lib/schemas";
import { checkUsernameAction } from "./check-username";

export type ProvisionMemberState = { error?: string; ok?: boolean };

/**
 * Office creates a staff login in one step. The new person is not a member
 * yet, so membership writes use privileged getDb() (RLS cannot insert
 * profiles for another user). Role is validated against provisionRoles +
 * capability; never school_admin. Does not sign in as the new member.
 */
export async function provisionMemberAction(
  workspace: string,
  _prev: ProvisionMemberState,
  formData: FormData,
): Promise<ProvisionMemberState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) {
    return { error: "You must be signed in to this workspace." };
  }

  const parsed = provisionMemberSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      error:
        "Enter name, email, username, matching passwords (at least 8 characters), and a role.",
    };
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    return { error: "Passwords do not match." };
  }

  const email = parsed.data.email.toLowerCase();
  const role = parsed.data.role as SchoolRole;
  const username = parsed.data.username;

  try {
    assertCapability(ctx, "members.provision", role);
  } catch {
    return { error: "You can only add non-admin roles." };
  }

  const usernameCheck = await checkUsernameAction(username, workspace);
  if (!usernameCheck.available) {
    return {
      error: usernameCheck.reason ?? "That username is taken. Pick another.",
    };
  }

  try {
    const existing = await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        const rows = await tx
          .select({ userId: schoolMembers.userId })
          .from(schoolMembers)
          .innerJoin(profiles, eq(schoolMembers.userId, profiles.id))
          .where(
            and(
              eq(schoolMembers.schoolId, ctx.schoolId),
              eq(profiles.email, email),
            ),
          )
          .limit(1);
        return rows[0] ?? null;
      },
    );
    if (existing) {
      return { error: "That email is already in this school." };
    }
  } catch (err) {
    console.error("provisionMemberAction existing-member check failed", err);
    return { error: "Could not create the account. Try again." };
  }

  let userId: string;
  try {
    userId = await createConfirmedAuthUser(email, parsed.data.password);
  } catch (err) {
    if (err instanceof AdminAuthUnavailableError) {
      return {
        error:
          "Staff accounts cannot be created until the server service role key is set.",
      };
    }
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    return {
      error:
        message.includes("already") || message.includes("registered")
          ? "An account with this email already exists. They should sign in instead."
          : "Could not create the account. Try again.",
    };
  }

  try {
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.insert(profiles).values({
        id: userId,
        fullName: parsed.data.fullName.trim(),
        email,
      });
      await tx.insert(schoolMembers).values({
        schoolId: ctx.schoolId,
        userId,
        role,
        username,
      });
      await tx.insert(adminAuditEvents).values({
        schoolId: ctx.schoolId,
        actorId: ctx.userId,
        action: "member.provision",
        entityType: "school_member",
        entityId: userId,
        targetUserId: userId,
        detail: { role },
      });
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("school_members_school_username_unique")
    ) {
      return { error: "That username was just taken. Pick another." };
    }
    console.error("provisionMemberAction membership write failed", err);
    return {
      error:
        "Account was created but workspace membership failed. Try again or contact support.",
    };
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/team`);
  return { ok: true };
}
