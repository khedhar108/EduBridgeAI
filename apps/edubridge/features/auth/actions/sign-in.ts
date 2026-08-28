"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  and,
  eq,
  getDb,
  isNull,
  profiles,
  schoolMembers,
  schools,
} from "@repo/db";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { resolvePostLoginDestination } from "../lib/redirects";
import { signInSchema } from "../lib/schemas";

export type SignInState = { error?: string };

/** Conservative slug check — lookup is still parameterized. */
const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function resolveSchoolSlug(formData: FormData): string {
  const workspace = String(formData.get("workspace") ?? "")
    .trim()
    .toLowerCase();
  if (SCHOOL_SLUG_PATTERN.test(workspace)) return workspace;

  const schoolSlug = String(formData.get("schoolSlug") ?? "")
    .trim()
    .toLowerCase();
  if (SCHOOL_SLUG_PATTERN.test(schoolSlug)) return schoolSlug;

  return "";
}

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your email or username and password." };
  }

  const identifier = parsed.data.email;
  const schoolSlug = resolveSchoolSlug(formData);
  const isEmail = identifier.includes("@");
  let signInEmail = identifier;

  if (!isEmail) {
    if (!schoolSlug) {
      return { error: "Enter your school slug when signing in with a username." };
    }
    const db = getDb();
    const rows = await db
      .select({ email: profiles.email })
      .from(schoolMembers)
      .innerJoin(schools, eq(schoolMembers.schoolId, schools.id))
      .innerJoin(profiles, eq(schoolMembers.userId, profiles.id))
      .where(
        and(
          eq(schoolMembers.username, identifier.toLowerCase()),
          eq(schools.slug, schoolSlug),
          eq(schoolMembers.isActive, true),
          isNull(schoolMembers.archivedAt),
        ),
      )
      .limit(1);

    if (!rows[0]?.email) {
      return { error: "Invalid username or school." };
    }
    signInEmail = rows[0].email;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: signInEmail,
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Invalid email or password." };
  }

  const next = formData.get("next");
  const preferPlatform = formData.get("surface") === "platform";
  revalidatePath("/", "layout");
  redirect(
    await resolvePostLoginDestination({
      preferPlatform,
      next: typeof next === "string" ? next : null,
    }),
  );
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
