"use server";

import { revalidatePath } from "next/cache";
import {
  adminAuditEvents,
  and,
  eq,
  schoolMembers,
  withTenant,
  type SchoolRole,
} from "@repo/db";
import { assertCapability } from "@/lib/auth/capabilities";
import {
  AdminAuthUnavailableError,
  updateAuthUserPassword,
} from "@/lib/auth/supabase-admin";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { resetMemberPasswordSchema } from "../lib/schemas";

export type ResetMemberPasswordState = { error?: string; ok?: boolean };

export async function resetMemberPasswordAction(
  workspace: string,
  _prev: ResetMemberPasswordState,
  formData: FormData,
): Promise<ResetMemberPasswordState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };

  const parsed = resetMemberPasswordSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return {
      error: "Enter matching passwords (at least 8 characters).",
    };
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    return { error: "Passwords do not match." };
  }

  const { targetUserId } = parsed.data;
  if (targetUserId === ctx.userId) {
    return { error: "You cannot reset your own password here." };
  }

  try {
    await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        const rows = await tx
          .select({
            role: schoolMembers.role,
            archivedAt: schoolMembers.archivedAt,
          })
          .from(schoolMembers)
          .where(
            and(
              eq(schoolMembers.schoolId, ctx.schoolId),
              eq(schoolMembers.userId, targetUserId),
            ),
          )
          .limit(1);

        const member = rows[0];
        if (!member) throw new Error("NOT_FOUND");
        if (member.archivedAt) throw new Error("ARCHIVED");

        const targetRole = member.role as SchoolRole;
        if (targetRole === "school_admin") {
          throw new Error("FORBIDDEN");
        }
        assertCapability(ctx, "members.resetPassword", targetRole);
      },
    );
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "NOT_FOUND") return { error: "Member not found." };
    if (code === "ARCHIVED") {
      return { error: "Archived members cannot have their password reset." };
    }
    if (code === "FORBIDDEN" || code === "Forbidden") {
      return { error: "You cannot reset this person's password." };
    }
    console.error("resetMemberPasswordAction lookup failed", err);
    return { error: "Could not reset the password. Try again." };
  }

  try {
    await updateAuthUserPassword(targetUserId, parsed.data.password);
  } catch (err) {
    if (err instanceof AdminAuthUnavailableError) {
      return {
        error:
          "Passwords cannot be reset until the server service role key is set.",
      };
    }
    console.error("resetMemberPasswordAction update failed", err);
    return { error: "Could not reset the password. Try again." };
  }

  try {
    await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        await tx.insert(adminAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "member.password_reset",
          entityType: "school_member",
          entityId: targetUserId,
          targetUserId,
        });
      },
    );
  } catch (err) {
    console.error("resetMemberPasswordAction audit failed", err);
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/team`);
  return { ok: true };
}
