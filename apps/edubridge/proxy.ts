import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthSurface =
    path === "/sign-in" ||
    path === "/platform/sign-in" ||
    path === "/join-school" ||
    path.startsWith("/auth/") ||
    path.startsWith("/accept-invite/");
  const isPlatform = path === "/platform" || path.startsWith("/platform/");
  const isPublicMarketing =
    path === "/blog" ||
    path.startsWith("/blog/") ||
    path === "/modules" ||
    path.startsWith("/modules/");
  const isWorkspace =
    path.length > 1 &&
    !path.startsWith("/api") &&
    !path.startsWith("/_next") &&
    !isAuthSurface &&
    !isPlatform &&
    !isPublicMarketing &&
    path !== "/" &&
    path !== "/db-check" &&
    path !== "/choose-workspace" &&
    path !== "/awaiting-invitation" &&
    !path.startsWith("/llm");

  if (!user && (isWorkspace || path === "/platform" || path === "/choose-workspace")) {
    const signIn =
      path.startsWith("/platform") ? "/platform/sign-in" : "/sign-in";
    const dest = request.nextUrl.clone();
    dest.pathname = signIn;
    dest.searchParams.set("next", path);
    return NextResponse.redirect(dest);
  }

  if (user && (path === "/sign-in" || path === "/platform/sign-in")) {
    // Let the page/action decide destination — avoid wrong bounce for owners.
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
