"use server";

import { revalidatePath } from "next/cache";
import {
  and,
  eq,
  membershipRequests,
  schoolMembers,
  withTenant,
  type SchoolRole,
} from "@repo/db";
import {
  assertRole,
  getSessionContext,
} from "@/lib/tenancy/session-context";
import { activateMemberSchema } from "../lib/schemas";

export type ActivateMemberState = { error?: string; ok?: boolean };

export async function activateMembershipRequestAction(
  workspace: string,
  _prev: ActivateMemberState,
  formData: FormData,
): Promise<ActivateMemberState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) {
    return { error: "You must be signed in as a school admin." };
  }
  assertRole(ctx, ["school_admin"]);

  const parsed = activateMemberSchema.safeParse({
    requestId: formData.get("requestId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: "Choose a valid role for this member." };
  }

  const role = parsed.data.role as SchoolRole;

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        const rows = await tx
          .select()
          .from(membershipRequests)
          .where(
            and(
              eq(membershipRequests.id, parsed.data.requestId),
              eq(membershipRequests.schoolId, ctx.schoolId),
              eq(membershipRequests.status, "pending"),
            ),
          )
          .limit(1);

        const request = rows[0];
        if (!request) {
          throw new Error("NOT_FOUND");
        }

        await tx.insert(schoolMembers).values({
          schoolId: ctx.schoolId,
          userId: request.userId,
          role,
        });

        await tx
          .update(membershipRequests)
          .set({
            status: "approved",
            activatedRole: role,
            reviewedBy: ctx.userId,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(membershipRequests.id, request.id));
      },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { error: "Request not found or already handled." };
    }
    console.error("activateMembershipRequestAction failed", err);
    return { error: "Could not activate member. Try again." };
  }

  revalidatePath(`/${workspace}/settings/team`);
  return { ok: true };
}

export async function rejectMembershipRequestAction(
  workspace: string,
  formData: FormData,
): Promise<void> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return;
  assertRole(ctx, ["school_admin"]);

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return;

  await withTenant(
    {
      sub: ctx.userId,
      school_id: ctx.schoolId,
      role: ctx.role,
    },
    async (tx) => {
      await tx
        .update(membershipRequests)
        .set({
          status: "rejected",
          reviewedBy: ctx.userId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(membershipRequests.id, requestId),
            eq(membershipRequests.schoolId, ctx.schoolId),
            eq(membershipRequests.status, "pending"),
          ),
        );
    },
  );

  revalidatePath(`/${workspace}/settings/team`);
}
