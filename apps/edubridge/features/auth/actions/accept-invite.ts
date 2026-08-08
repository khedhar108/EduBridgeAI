"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  and,
  eq,
  getDb,
  invitations,
  isNull,
  profiles,
  schoolMembers,
  schools,
} from "@repo/db";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { acceptInviteSchema } from "../lib/schemas";

export type AcceptInviteState = { error?: string };

/**
 * Accept uses privileged DB writes: the invitee is not a member yet, so RLS
 * cannot insert school_members. Role always comes from the invitation row.
 */
export async function acceptInviteAction(
  token: string,
  _prev: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    fullName: formData.get("fullName"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your name and a password (at least 8 characters)." };
  }

  const db = getDb();
  const rows = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      schoolId: invitations.schoolId,
      schoolSlug: schools.slug,
      expiresAt: invitations.expiresAt,
      acceptedAt: invitations.acceptedAt,
    })
    .from(invitations)
    .innerJoin(schools, eq(invitations.schoolId, schools.id))
    .where(and(eq(invitations.token, token), isNull(invitations.acceptedAt)))
    .limit(1);

  const invite = rows[0];
  if (!invite) {
    return { error: "This invitation is invalid or already used." };
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return { error: "This invitation has expired. Ask your admin for a new one." };
  }
  if (invite.role === "platform_owner") {
    return { error: "Invalid invitation." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: invite.email,
    password: parsed.data.password,
  });

  if (signUpError || !signUpData.user) {
    return {
      error:
        signUpError?.message?.includes("already") ||
        signUpError?.message?.includes("registered")
          ? "An account with this email already exists. Sign in, then ask an admin to re-invite if needed."
          : "Could not create your account. Try again.",
    };
  }

  const userId = signUpData.user.id;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(profiles).values({
        id: userId,
        fullName: parsed.data.fullName.trim(),
      });
      await tx.insert(schoolMembers).values({
        schoolId: invite.schoolId,
        userId,
        role: invite.role,
      });
      await tx
        .update(invitations)
        .set({ acceptedAt: new Date(), updatedAt: new Date() })
        .where(eq(invitations.id, invite.id));
    });
  } catch (err) {
    console.error("acceptInviteAction membership write failed", err);
    return {
      error:
        "Account was created but workspace membership failed. Contact your school admin.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${invite.schoolSlug}`);
}
