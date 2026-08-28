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

/**
 * Permanently archive a school member (admin only). Sets archived_at /
 * archived_by and is_active = false in one write. Coordinators cannot call
 * this — including against other coordinators (the "delete coordinator" path
 * is admin-only archive).
 */
export type ArchiveMemberState = { error?: string; ok?: boolean };

export async function archiveMemberAction(
  workspace: string,
  targetUserId: string,
): Promise<ArchiveMemberState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  if (!targetUserId || targetUserId === ctx.userId) {
    return { error: "You cannot archive your own account." };
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
        if (member.archivedAt) throw new Error("ALREADY_ARCHIVED");

        const targetRole = member.role as SchoolRole;
        if (targetRole === "school_admin") {
          throw new Error("FORBIDDEN");
        }
        assertCapability(ctx, "members.archive", targetRole);

        const now = new Date();
        await tx
          .update(schoolMembers)
          .set({
            archivedAt: now,
            archivedBy: ctx.userId,
            isActive: false,
            updatedAt: now,
          })
          .where(
            and(
              eq(schoolMembers.schoolId, ctx.schoolId),
              eq(schoolMembers.userId, targetUserId),
            ),
          );

        await tx.insert(adminAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "member.archive",
          entityType: "school_member",
          entityId: targetUserId,
          targetUserId,
          detail: { role: targetRole },
        });
      },
    );
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "NOT_FOUND") return { error: "Member not found." };
    if (code === "ALREADY_ARCHIVED") return { error: "Already archived." };
    if (code === "FORBIDDEN") return { error: "You cannot archive this role." };
    console.error("archiveMemberAction failed", err);
    return { error: "Could not archive this member. Try again." };
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/team`);
  return { ok: true };
}
