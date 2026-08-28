"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  and,
  eq,
  profiles,
  schoolMembers,
  adminAuditEvents,
  getDb,
  withTenant,
} from "@repo/db";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { assertCapability } from "@/lib/auth/capabilities";
import {
  setImpersonationCookie,
  clearImpersonationCookie,
} from "@/lib/tenancy/impersonation";

/**
 * Admin starts viewing the workspace as a target member. The admin's Supabase
 * session stays intact — a signed cookie swaps the tenant identity in
 * getSessionContext + withTenant claims. RLS then sees the target user.
 *
 * Guards: admin only, same school, target is active, target is NOT admin or
 * coordinator, target is not self. Every session is audited.
 */
export async function startImpersonationAction(
  workspace: string,
  formData: FormData,
): Promise<void> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return;

  const targetUserId = String(formData.get("targetUserId") ?? "");
  if (!targetUserId) return;
  if (targetUserId === ctx.userId) return;

  try {
    assertCapability(ctx, "members.impersonate");
  } catch {
    return;
  }

  try {
    const targetEmail = await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        const rows = await tx
          .select({
            role: schoolMembers.role,
            isActive: schoolMembers.isActive,
            email: profiles.email,
            fullName: profiles.fullName,
          })
          .from(schoolMembers)
          .innerJoin(profiles, eq(schoolMembers.userId, profiles.id))
          .where(
            and(
              eq(schoolMembers.schoolId, ctx.schoolId),
              eq(schoolMembers.userId, targetUserId),
            ),
          )
          .limit(1);

        const target = rows[0];
        if (!target) throw new Error("NOT_FOUND");
        if (!target.isActive) throw new Error("INACTIVE");
        if (target.role === "school_admin" || target.role === "coordinator") {
          throw new Error("PROTECTED");
        }

        await tx.insert(adminAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "impersonate.start",
          entityType: "school_member",
          entityId: targetUserId,
          targetUserId,
          detail: { targetRole: target.role, targetName: target.fullName },
        });

        return target.email;
      },
    );

    await setImpersonationCookie({
      targetUserId,
      targetRole: "",
      targetEmail,
      schoolId: ctx.schoolId,
    });
  } catch (err) {
    console.error("startImpersonationAction failed", err);
    return;
  }

  revalidatePath(`/${workspace}`, "layout");
  redirect(`/${workspace}`);
}

/**
 * End impersonation: clear the cookie and return to the admin's own view.
 * The audit row is written via privileged DB (the session identity is the
 * target, not the admin, so RLS would reject an admin-scoped insert).
 */
export async function stopImpersonationAction(
  workspace: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const ctx = await getSessionContext(workspace);
  if (!ctx?.isImpersonating) {
    redirect(`/${workspace}`);
  }

  await clearImpersonationCookie();

  const db = getDb();
  await db.insert(adminAuditEvents).values({
    schoolId: ctx.schoolId,
    actorId: ctx.realUserId,
    action: "impersonate.stop",
    entityType: "school_member",
    entityId: ctx.userId,
    targetUserId: ctx.userId,
    detail: { targetRole: ctx.role },
  });

  revalidatePath(`/${workspace}`, "layout");
  redirect(`/${workspace}`);
}
