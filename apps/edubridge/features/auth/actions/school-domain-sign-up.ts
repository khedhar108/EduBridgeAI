"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { ensureDomainJoinRequest } from "@/lib/tenancy/domain-join";
import {
  emailDomain,
  isEligibleSchoolEmailDomain,
} from "@/lib/tenancy/email-domain";
import { schoolDomainSignUpSchema } from "../lib/schemas";

export type SchoolDomainSignUpState = { error?: string };

/**
 * Sign up with a school-domain email → pending membership_requests.
 * Does not create school_members until admin activates.
 */
export async function schoolDomainSignUpAction(
  _prev: SchoolDomainSignUpState,
  formData: FormData,
): Promise<SchoolDomainSignUpState> {
  const parsed = schoolDomainSignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { error: "Enter your school email, name, and a password (8+ chars)." };
  }

  const email = parsed.data.email.toLowerCase();
  const domain = emailDomain(email);
  if (!domain || !isEligibleSchoolEmailDomain(domain)) {
    return {
      error:
        "Use your official school email (not Gmail/Yahoo/etc.), or ask for an invite link.",
    };
  }

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
  });

  if (!join) {
    return {
      error:
        "No school is registered for that email domain. Ask your admin for an invite.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/awaiting-invitation");
}
