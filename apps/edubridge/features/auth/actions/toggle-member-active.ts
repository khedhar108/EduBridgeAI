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
 * Deactivation takes effect instantly — the target's next request hits
 * is_school_member → false → 404. No session revocation needed.
 */
export async function toggleMemberActiveAction(
  workspace: string,
  formData: FormData,
): Promise<void> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return;

  const targetUserId = String(formData.get("targetUserId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!targetUserId || !action) return;
  if (targetUserId === ctx.userId) return;

  const capability = action === "deactivate" ? "members.deactivate" : "members.reactivate";

  try {
    await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        const rows = await tx
          .select({ role: schoolMembers.role, isActive: schoolMembers.isActive })
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

        const targetRole = member.role as SchoolRole;
        assertCapability(ctx, capability, targetRole);

        if (action === "deactivate" && !member.isActive) throw new Error("ALREADY_INACTIVE");
        if (action === "activate" && member.isActive) throw new Error("ALREADY_ACTIVE");

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
          action: action === "deactivate" ? "member.deactivate" : "member.reactivate",
          entityType: "school_member",
          entityId: targetUserId,
          targetUserId,
          detail: { role: targetRole, previousActive: member.isActive },
        });
      },
    );
  } catch (err) {
    console.error("toggleMemberActiveAction failed", err);
    return;
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/team`);
}
