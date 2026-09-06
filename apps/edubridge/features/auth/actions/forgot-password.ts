"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getPublicOrigin } from "@/lib/auth/public-origin";

export type ForgotPasswordState = { error?: string; ok?: boolean };
export type UpdatePasswordState = { error?: string };

const emailSchema = z.object({
  email: z.string().email().max(320),
});

const passwordSchema = z.object({
  password: z.string().min(8).max(128),
  passwordConfirm: z.string().min(8).max(128),
});

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Enter the email on the account." };
  }

  const origin = await getPublicOrigin();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email.toLowerCase(),
    { redirectTo: `${origin}/auth/callback?next=/update-password` },
  );
  if (error) {
    console.error("requestPasswordResetAction", error);
  }
  return { ok: true };
}

export async function updatePasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { error: "Enter a new password (8+ characters) twice." };
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Open the reset link from your email again." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Could not update the password. Try the email link again." };
  }

  redirect("/sign-in");
}
