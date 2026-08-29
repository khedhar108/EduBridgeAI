import { PLATFORM_DOMAIN } from "../brand";
import { RESERVED_WORKSPACE_SLUGS } from "./school-slug";

export type ParsedWorkspaceHost =
  | { kind: "apex" }
  | { kind: "platform" }
  | { kind: "school"; slug: string };

/** First Host / X-Forwarded-Host value, lowercase, port stripped. */
export function hostnameFromHeaders(headerList: Headers): string {
  const raw =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerList.get("host") ??
    "";
  return stripPort(raw.toLowerCase());
}

export function stripPort(host: string): string {
  if (!host) return "";
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host : host.slice(0, end + 1);
  }
  const colon = host.lastIndexOf(":");
  if (colon !== -1 && /^\d+$/.test(host.slice(colon + 1))) {
    return host.slice(0, colon);
  }
  return host;
}

/**
 * Apex = marketing + path `/{slug}`. School = `{slug}.{PLATFORM_DOMAIN}` or
 * `{slug}.localhost`. Nested labels (`a.b.edubridge.app`) stay apex (no custom domains).
 */
export function parseWorkspaceHost(
  hostname: string,
  rootDomain: string = PLATFORM_DOMAIN,
): ParsedWorkspaceHost {
  const host = hostname.trim().toLowerCase();
  if (!host) return { kind: "apex" };

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]" ||
    host === rootDomain ||
    host === `www.${rootDomain}` ||
    host.endsWith(".vercel.app")
  ) {
    return { kind: "apex" };
  }

  if (host === `platform.${rootDomain}` || host === "platform.localhost") {
    return { kind: "platform" };
  }

  let slug: string | null = null;
  if (host.endsWith(`.${rootDomain}`)) {
    slug = host.slice(0, -(rootDomain.length + 1));
  } else if (host.endsWith(".localhost")) {
    slug = host.slice(0, -".localhost".length);
  }

  if (!slug || slug.includes(".")) return { kind: "apex" };
  if (RESERVED_WORKSPACE_SLUGS.has(slug)) return { kind: "apex" };
  if (!slug.endsWith("-bridge")) return { kind: "apex" };
  return { kind: "school", slug };
}

export function isSchoolHostForSlug(hostname: string, schoolSlug: string): boolean {
  const parsed = parseWorkspaceHost(hostname);
  return (
    parsed.kind === "school" &&
    parsed.slug === schoolSlug.trim().toLowerCase()
  );
}

export type WorkspaceUrlDisplay = {
  slug: string;
  shareHost: string;
  shareUrl: string;
  onSchoolHost: boolean;
  localHint: string | null;
};

/** Shareable production host plus a local path hint when not already on that host. */
export function workspaceUrlDisplay(
  schoolSlug: string,
  hostname: string,
): WorkspaceUrlDisplay {
  const slug = schoolSlug.trim().toLowerCase();
  const shareHost = `${slug}.${PLATFORM_DOMAIN}`;
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
  return {
    slug,
    shareHost,
    shareUrl: `https://${shareHost}`,
    onSchoolHost: isSchoolHostForSlug(hostname, slug),
    localHint: isLoopback ? `http://localhost:3000/${slug}` : `/${slug}`,
  };
}
