import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { NextResponse } from "next/server";
import { resolvePostLoginDestination, safeNextPath } from "@/features/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest = next ?? (await resolvePostLoginDestination());
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
