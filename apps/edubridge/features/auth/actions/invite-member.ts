"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  and,
  eq,
  invitations,
  isNull,
  withTenant,
  type SchoolRole,
} from "@repo/db";
import {
  getSessionContext,
} from "@/lib/tenancy/session-context";
import { assertCapability } from "@/lib/auth/capabilities";
import { inviteMemberSchema } from "../lib/schemas";

export type InviteMemberState = {
  error?: string;
  inviteUrl?: string;
};

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function inviteMemberAction(
  workspace: string,
  _prev: InviteMemberState,
  formData: FormData,
): Promise<InviteMemberState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) {
    return { error: "You must be signed in to this workspace." };
  }

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and school role." };
  }

  const email = parsed.data.email.toLowerCase();
  const role = parsed.data.role as SchoolRole;

  try {
    assertCapability(ctx, "members.invite", role);
  } catch {
    return { error: "You can only invite non-admin roles." };
  }
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        const existing = await tx
          .select({ id: invitations.id })
          .from(invitations)
          .where(
            and(
              eq(invitations.schoolId, ctx.schoolId),
              eq(invitations.email, email),
              isNull(invitations.acceptedAt),
            ),
          )
          .limit(1);

        if (existing[0]) {
          throw new Error("PENDING_EXISTS");
        }

        await tx.insert(invitations).values({
          schoolId: ctx.schoolId,
          email,
          role,
          token,
          invitedBy: ctx.userId,
          expiresAt,
        });
      },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "PENDING_EXISTS") {
      return { error: "A pending invitation already exists for that email." };
    }
    console.error("inviteMemberAction failed", err);
    return { error: "Could not create invitation. Try again." };
  }

  revalidatePath(`/${workspace}/settings/team`);
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return { inviteUrl: `${origin}/accept-invite/${token}` };
}
