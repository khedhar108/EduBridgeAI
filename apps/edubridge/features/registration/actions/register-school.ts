"use server";

import { redirect } from "next/navigation";
import { persistAcceptedTerms } from "@/lib/legal/accept-terms";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getPublicOrigin } from "@/lib/auth/public-origin";
import {
  emailDomain,
  isEligibleSchoolEmailDomain,
} from "@/lib/tenancy/email-domain";
import { pendingSchoolMetadata } from "@/lib/tenancy/pending-school";
import {
  provisionSchoolForUser,
  schoolDomainTaken,
  schoolSlugTaken,
  tryProvisionPendingSchool,
} from "@/lib/tenancy/provision-school";
import {
  normalizeWorkspaceSlug,
  workspaceSlugError,
} from "@/lib/tenancy/school-slug";
import {
  registerSchoolSchema,
  resendRegisterOtpSchema,
  verifyRegisterOtpSchema,
} from "../lib/schemas";

export type RegisterSchoolState = { error?: string };
export type VerifyRegisterState = { error?: string; ok?: boolean };
export type CheckSlugState = { available: boolean; reason?: string };

export async function checkSlugAction(raw: string): Promise<CheckSlugState> {
  const slug = normalizeWorkspaceSlug(raw);
  const formatError = workspaceSlugError(slug);
  if (formatError) return { available: false, reason: formatError };
  if (await schoolSlugTaken(slug)) {
    return { available: false, reason: "That workspace name is taken." };
  }
  return { available: true };
}

export async function startSchoolRegisterAction(
  _prev: RegisterSchoolState,
  formData: FormData,
): Promise<RegisterSchoolState> {
  const parsed = registerSchoolSchema.safeParse({
    schoolName: formData.get("schoolName"),
    country: formData.get("country") || "IN",
    state: formData.get("state"),
    city: formData.get("city"),
    pincode: formData.get("pincode") ?? "",
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) {
    return {
      error:
        "Check school name, location, your name, official email, username, matching passwords, and workspace URL.",
    };
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    return { error: "Passwords do not match." };
  }

  const terms = await persistAcceptedTerms(formData);
  if (!terms.ok) return { error: terms.error };

  const email = parsed.data.email.toLowerCase();
  const domain = emailDomain(email);
  if (!domain || !isEligibleSchoolEmailDomain(domain)) {
    return {
      error:
        "Use your official school email (not Gmail/Yahoo/etc.). Personal inboxes cannot open a school.",
    };
  }

  const slug = normalizeWorkspaceSlug(parsed.data.slug);
  const slugError = workspaceSlugError(slug);
  if (slugError) return { error: slugError };

  if (await schoolDomainTaken(domain)) {
    return {
      error:
        "A school is already registered for that email domain. Sign in, or request access from the office.",
    };
  }
  if (await schoolSlugTaken(slug)) {
    return { error: "That workspace name is taken. Pick another." };
  }

  const pending = pendingSchoolMetadata({
    name: parsed.data.schoolName,
    slug,
    country: parsed.data.country,
    state: parsed.data.state,
    city: parsed.data.city,
    pincode: parsed.data.pincode === "" ? null : parsed.data.pincode,
    fullName: parsed.data.fullName,
    username: parsed.data.username,
  });

  const origin = await getPublicOrigin();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: pending,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error || !data.user) {
    const message = error?.message?.toLowerCase() ?? "";
    return {
      error:
        message.includes("already") || message.includes("registered")
          ? "An account with this email already exists. Sign in, or check your inbox for the verification code."
          : "Could not create the account. Try again.",
    };
  }

  if (data.session) {
    const provisioned = await provisionSchoolForUser({
      userId: data.user.id,
      email,
      pending: {
        name: parsed.data.schoolName,
        slug,
        country: parsed.data.country,
        state: parsed.data.state,
        city: parsed.data.city,
        pincode: parsed.data.pincode === "" ? null : parsed.data.pincode,
        fullName: parsed.data.fullName,
        username: parsed.data.username,
      },
    });
    if (!provisioned.ok) return { error: provisioned.error };
    redirect(`/${provisioned.slug}?welcome=1`);
  }

  redirect(`/register/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyRegisterOtpAction(
  _prev: VerifyRegisterState,
  formData: FormData,
): Promise<VerifyRegisterState> {
  const parsed = verifyRegisterOtpSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return { error: "Enter the 6-digit code from your school email." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email.toLowerCase(),
    token: parsed.data.token.replace(/\s/g, ""),
    type: "signup",
  });
  if (error || !data.user) {
    return { error: "That code is wrong or expired. Try again or resend it." };
  }

  const provisioned = await tryProvisionPendingSchool(data.user);
  if (!provisioned) {
    return {
      error:
        "Your email is verified, but school details were missing. Start registration again.",
    };
  }
  if (!provisioned.ok) return { error: provisioned.error };
  redirect(`/${provisioned.slug}?welcome=1`);
}

export async function resendRegisterOtpAction(
  _prev: VerifyRegisterState,
  formData: FormData,
): Promise<VerifyRegisterState> {
  const parsed = resendRegisterOtpSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: "Enter your school email." };

  const origin = await getPublicOrigin();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email.toLowerCase(),
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return { error: "Could not resend the code. Wait a minute and try again." };
  }
  return { ok: true };
}
