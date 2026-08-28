import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const WORKSPACE_AUTH_DOORS = new Set(["sign-in", "family"]);

const RESERVED_ROOT_SEGMENTS = new Set([
  "sign-in",
  "platform",
  "join-school",
  "auth",
  "choose-workspace",
  "awaiting-invitation",
  "api",
  "_next",
  "blog",
  "modules",
  "db-check",
  "llm",
  "status",
  "hero-preview",
]);

function pathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** `/{slug}/sign-in` and `/{slug}/family` (plus nested family paths). */
function isWorkspaceAuthPath(pathname: string): boolean {
  const segments = pathSegments(pathname);
  const slug = segments[0];
  const door = segments[1];
  if (!slug || !door) return false;
  if (RESERVED_ROOT_SEGMENTS.has(slug)) return false;
  return WORKSPACE_AUTH_DOORS.has(door);
}

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
    isWorkspaceAuthPath(path);
  const isPlatform = path === "/platform" || path.startsWith("/platform/");
  const isPublicMarketing =
    path === "/blog" ||
    path.startsWith("/blog/") ||
    path === "/modules" ||
    path.startsWith("/modules/");
  const firstSegment = pathSegments(path)[0];
  const isWorkspace =
    Boolean(firstSegment) &&
    !RESERVED_ROOT_SEGMENTS.has(firstSegment!) &&
    !isAuthSurface &&
    !isPlatform &&
    !isPublicMarketing &&
    path !== "/" &&
    !path.startsWith("/llm");

  if (!user && (isWorkspace || path === "/platform" || path === "/choose-workspace")) {
    const slug = firstSegment;
    const signIn =
      path.startsWith("/platform")
        ? "/platform/sign-in"
        : slug && isWorkspace
          ? `/${slug}/sign-in`
          : "/sign-in";
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
