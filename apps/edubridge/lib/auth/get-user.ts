import { createServerSupabaseClient } from "./supabase-server";

/** Verified user only — never trust getSession() alone for authz. */
export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}
