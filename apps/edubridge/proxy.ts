import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hostnameFromHeaders, parseWorkspaceHost } from "@/lib/tenancy/workspace-host";

const WORKSPACE_AUTH_DOORS = new Set(["sign-in", "family"]);

const RESERVED_ROOT_SEGMENTS = new Set([
  "sign-in",
  "platform",
  "join-school",
  "register",
  "forgot-password",
  "update-password",
  "auth",
  "choose-workspace",
  "awaiting-invitation",
  "api",
  "_next",
  "blog",
  "modules",
  "terms",
  "privacy",
  "cookies",
  "db-check",
  "llm",
  "status",
  "hero-preview",
]);

function pathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
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

function isAuthSurface(pathname: string): boolean {
  return (
    pathname === "/sign-in" ||
    pathname === "/platform/sign-in" ||
    pathname === "/join-school" ||
    pathname === "/register" ||
    pathname.startsWith("/register/") ||
    pathname === "/forgot-password" ||
    pathname === "/update-password" ||
    pathname.startsWith("/auth/") ||
    isWorkspaceAuthPath(pathname)
  );
}

function isPublicMarketing(pathname: string): boolean {
  return (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/modules" ||
    pathname.startsWith("/modules/") ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/cookies"
  );
}

function isPlatformPath(pathname: string): boolean {
  return pathname === "/platform" || pathname.startsWith("/platform/");
}

/** On a school host, `/sign-in` and `/family` rewrite in; other reserved roots stay global. */
function rewriteOnSchoolHost(pathname: string): boolean {
  const first = pathSegments(pathname)[0];
  if (!first) return true;
  if (WORKSPACE_AUTH_DOORS.has(first)) return true;
  if (RESERVED_ROOT_SEGMENTS.has(first)) return false;
  return true;
}

function stripPrefix(pathname: string, prefix: string): string {
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || "/";
  }
  return pathname;
}

function isPathWorkspace(pathname: string): boolean {
  const firstSegment = pathSegments(pathname)[0];
  return (
    Boolean(firstSegment) &&
    !RESERVED_ROOT_SEGMENTS.has(firstSegment!) &&
    !isAuthSurface(pathname) &&
    !isPlatformPath(pathname) &&
    !isPublicMarketing(pathname) &&
    pathname !== "/" &&
    !pathname.startsWith("/llm")
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in production.",
      );
    }
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

  const publicPath = request.nextUrl.pathname;
  const hostInfo = parseWorkspaceHost(hostnameFromHeaders(request.headers));

  if (hostInfo.kind === "school") {
    const prefix = `/${hostInfo.slug}`;
    if (publicPath === prefix || publicPath.startsWith(`${prefix}/`)) {
      const dest = request.nextUrl.clone();
      dest.pathname = stripPrefix(publicPath, prefix);
      return copyCookies(response, NextResponse.redirect(dest, 308));
    }
  }

  if (hostInfo.kind === "platform") {
    if (publicPath === "/platform" || publicPath.startsWith("/platform/")) {
      const dest = request.nextUrl.clone();
      dest.pathname = stripPrefix(publicPath, "/platform");
      return copyCookies(response, NextResponse.redirect(dest, 308));
    }
  }

  let internalPath = publicPath;
  if (hostInfo.kind === "school" && rewriteOnSchoolHost(publicPath)) {
    internalPath = publicPath === "/" ? `/${hostInfo.slug}` : `/${hostInfo.slug}${publicPath}`;
  } else if (hostInfo.kind === "platform") {
    const first = pathSegments(publicPath)[0];
    const passthrough =
      Boolean(first) &&
      RESERVED_ROOT_SEGMENTS.has(first!) &&
      first !== "platform" &&
      first !== "sign-in";
    if (!passthrough) {
      internalPath =
        publicPath === "/" ? "/platform" : `/platform${publicPath}`;
    }
  }

  const needsStaffSession =
    hostInfo.kind === "school" && rewriteOnSchoolHost(publicPath)
      ? !isAuthSurface(internalPath) && !isPublicMarketing(publicPath)
      : hostInfo.kind === "platform"
        ? !isAuthSurface(internalPath)
        : isPathWorkspace(publicPath) ||
          publicPath === "/platform" ||
          publicPath === "/choose-workspace";

  if (!user && needsStaffSession) {
    const firstSegment = pathSegments(internalPath)[0];
    const signIn =
      hostInfo.kind === "school"
        ? "/sign-in"
        : hostInfo.kind === "platform" || isPlatformPath(publicPath)
          ? "/platform/sign-in"
          : firstSegment && isPathWorkspace(publicPath)
            ? `/${firstSegment}/sign-in`
            : "/sign-in";
    const dest = request.nextUrl.clone();
    dest.pathname = signIn;
    dest.searchParams.set("next", publicPath);
    return copyCookies(response, NextResponse.redirect(dest));
  }

  if (
    user &&
    (publicPath === "/sign-in" || publicPath === "/platform/sign-in")
  ) {
    return response;
  }

  if (internalPath !== publicPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return copyCookies(response, NextResponse.rewrite(rewriteUrl));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
