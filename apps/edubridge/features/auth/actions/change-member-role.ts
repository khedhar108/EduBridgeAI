"use server";

import { revalidatePath } from "next/cache";
import {
  and,
  eq,
  schoolMembers,
  adminAuditEvents,
  withTenant,
  type SchoolRole,
} from "@repo/db";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { assertCapability } from "@/lib/auth/capabilities";
import { changeMemberRoleSchema } from "../lib/schemas";

/**
 * Admin-only role change. Cannot grant school_admin (one per workspace).
 * Refuses self-change and archived targets.
 */
export type ChangeMemberRoleState = { error?: string; ok?: boolean };

export async function changeMemberRoleAction(
  workspace: string,
  targetUserId: string,
  nextRole: string,
): Promise<ChangeMemberRoleState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  if (!targetUserId || targetUserId === ctx.userId) {
    return { error: "You cannot change your own role." };
  }

  const parsed = changeMemberRoleSchema.safeParse({
    targetUserId,
    role: nextRole,
  });
  if (!parsed.success) return { error: "Choose a valid role." };

  const newRole = parsed.data.role as SchoolRole;

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

        const currentRole = member.role as SchoolRole;
        if (currentRole === newRole) return;
        if (currentRole === "school_admin") throw new Error("FORBIDDEN");

        assertCapability(ctx, "members.changeRole", currentRole);
        assertCapability(ctx, "members.changeRole", newRole);

        await tx
          .update(schoolMembers)
          .set({ role: newRole, updatedAt: new Date() })
          .where(
            and(
              eq(schoolMembers.schoolId, ctx.schoolId),
              eq(schoolMembers.userId, targetUserId),
            ),
          );

        await tx.insert(adminAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "member.role_change",
          entityType: "school_member",
          entityId: targetUserId,
          targetUserId,
          detail: { from: currentRole, to: newRole },
        });
      },
    );
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "NOT_FOUND") return { error: "Member not found." };
    if (code === "ARCHIVED") return { error: "Archived members cannot change role." };
    if (code === "FORBIDDEN") return { error: "You cannot change this role." };
    console.error("changeMemberRoleAction failed", err);
    return { error: "Could not change role. Try again." };
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/team`);
  return { ok: true };
}
