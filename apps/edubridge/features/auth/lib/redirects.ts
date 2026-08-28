import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/get-user";
import { isPlatformOwnerUser } from "@/lib/access/platform-context";
import { ensureDomainJoinRequest } from "@/lib/tenancy/domain-join";
import { listMembershipsForUser } from "@/lib/tenancy/session-context";

const LAST_WORKSPACE_COOKIE = "eb_last_workspace";

/** Reject open redirects — relative paths only. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function pathSegments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** Global `/sign-in` and workspace `/{slug}/sign-in` or `/{slug}/family`. */
export function isAuthDoorPath(path: string): boolean {
  const parts = pathSegments(path);
  if (parts[0] === "sign-in") return true;
  return parts[1] === "sign-in" || parts[1] === "family";
}

/** Default post-login path for the workspace sign-in form. */
export function workspaceSignInNext(
  workspace: string,
  next?: string | null,
): string {
  const fallback = `/${workspace}`;
  const safe = safeNextPath(next);
  if (!safe || isAuthDoorPath(safe)) return fallback;
  return safe;
}

export async function resolvePostLoginDestination(opts?: {
  preferPlatform?: boolean;
  next?: string | null;
}): Promise<string> {
  const next = safeNextPath(opts?.next ?? null);
  const user = await requireUser();
  if (!user) return "/sign-in";

  if (opts?.preferPlatform || isPlatformOwnerUser(user)) {
    if (opts?.preferPlatform && !isPlatformOwnerUser(user)) {
      return "/platform/sign-in?error=forbidden";
    }
    if (
      isPlatformOwnerUser(user) &&
      (opts?.preferPlatform || next?.startsWith("/platform"))
    ) {
      return next && next.startsWith("/platform") ? next : "/platform";
    }
    if (opts?.preferPlatform && isPlatformOwnerUser(user)) {
      return "/platform";
    }
  }

  if (next && !next.startsWith("/platform") && !isAuthDoorPath(next)) {
    return next;
  }

  const memberships = await listMembershipsForUser(user.id);
  if (memberships.length === 1) {
    return `/${memberships[0]!.schoolSlug}`;
  }
  if (memberships.length > 1) {
    const jar = await cookies();
    const last = jar.get(LAST_WORKSPACE_COOKIE)?.value;
    if (last && memberships.some((m) => m.schoolSlug === last)) {
      return `/${last}`;
    }
    return "/choose-workspace";
  }

  if (isPlatformOwnerUser(user)) {
    return "/platform";
  }

  if (user.email) {
    await ensureDomainJoinRequest({
      userId: user.id,
      email: user.email,
    });
  }

  return "/awaiting-invitation";
}
