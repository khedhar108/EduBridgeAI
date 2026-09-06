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
 * Activate or deactivate a school member. Two-layer enforcement:
 *   1. App: assertCapability (coordinator can't touch admins, can't target self)
 *   2. RLS: is_school_member / update policy re-checks on next request
 *
 * Archived members cannot be reactivated through this toggle.
 * Deactivation takes effect instantly — the target's next request hits
 * is_school_member → false → 404. No session revocation needed.
 */
export type ToggleMemberActiveState = { error?: string; ok?: boolean };

export async function toggleMemberActiveAction(
  workspace: string,
  targetUserId: string,
  action: "deactivate" | "activate",
): Promise<ToggleMemberActiveState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };

  if (!targetUserId || (action !== "deactivate" && action !== "activate")) {
    return { error: "Invalid request." };
  }
  if (targetUserId === ctx.userId) {
    return { error: "You cannot change your own access." };
  }

  const capability =
    action === "deactivate" ? "members.deactivate" : "members.reactivate";

  try {
    await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        const rows = await tx
          .select({
            role: schoolMembers.role,
            isActive: schoolMembers.isActive,
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
        assertCapability(ctx, capability, targetRole);

        if (action === "deactivate" && !member.isActive) {
          throw new Error("ALREADY_INACTIVE");
        }
        if (action === "activate" && member.isActive) {
          throw new Error("ALREADY_ACTIVE");
        }

        await tx
          .update(schoolMembers)
          .set({ isActive: action === "activate", updatedAt: new Date() })
          .where(
            and(
              eq(schoolMembers.schoolId, ctx.schoolId),
              eq(schoolMembers.userId, targetUserId),
            ),
          );

        await tx.insert(adminAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action:
            action === "deactivate" ? "member.deactivate" : "member.reactivate",
          entityType: "school_member",
          entityId: targetUserId,
          targetUserId,
          detail: { role: targetRole, previousActive: member.isActive },
        });
      },
    );
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "NOT_FOUND") return { error: "Member not found." };
    if (code === "ARCHIVED") {
      return { error: "Archived members cannot be restored this way." };
    }
    if (code === "ALREADY_INACTIVE") return { error: "Already inactive." };
    if (code === "ALREADY_ACTIVE") return { error: "Already active." };
    console.error("toggleMemberActiveAction failed", err);
    return { error: "Could not update access. Try again." };
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/team`);
  return { ok: true };
}
