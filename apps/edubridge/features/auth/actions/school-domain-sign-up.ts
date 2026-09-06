"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { ensureDomainJoinRequest } from "@/lib/tenancy/domain-join";
import { persistAcceptedTerms } from "@/lib/legal/accept-terms";
import { schoolEmailGateError } from "@/lib/tenancy/email-domain";
import { schoolDomainSignUpSchema } from "../lib/schemas";

export type SchoolDomainSignUpState = { error?: string };

/**
 * Sign up with a school-domain email → pending membership_requests.
 * Does not create school_members until admin activates. Username is stored
 * on the pending request and copied to school_members on activation — the
 * per-school uniqueness is enforced at that point, not here.
 */
export async function schoolDomainSignUpAction(
  _prev: SchoolDomainSignUpState,
  formData: FormData,
): Promise<SchoolDomainSignUpState> {
  const parsed = schoolDomainSignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { error: "Enter your school email, name, a username, and a password (8+ chars)." };
  }

  const terms = await persistAcceptedTerms(formData);
  if (!terms.ok) return { error: terms.error };

  const email = parsed.data.email.toLowerCase();
  const emailError = schoolEmailGateError(email);
  if (emailError) return { error: emailError };

  // Username uniqueness is checked at activation time (per-school), not here.

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return {
      error: error?.message?.includes("already")
        ? "Account exists — sign in instead. If you have no access yet, wait for admin activation."
        : "Could not create account. Try again.",
    };
  }

  const join = await ensureDomainJoinRequest({
    userId: data.user.id,
    email,
    fullName: parsed.data.fullName,
    username: parsed.data.username,
  });

  if (!join) {
    return {
      error:
        "No school is registered for that email domain. Ask the office to create your account.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/awaiting-invitation");
}
