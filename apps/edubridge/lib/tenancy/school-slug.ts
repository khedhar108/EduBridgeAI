/** Workspace slug helpers. Shape matches `schools.slug` CHECK + ADR-006 reserved names. */

const SLUG_BODY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_WORKSPACE_SLUGS = new Set([
  "www",
  "platform",
  "api",
  "app",
  "admin",
  "mail",
  "ftp",
  "cdn",
  "static",
  "assets",
  "auth",
  "sign-in",
  "register",
  "status",
  "blog",
  "modules",
  "terms",
  "privacy",
  "cookies",
  "join-school",
  "choose-workspace",
  "awaiting-invitation",
  "db-check",
  "llm",
  "hero-preview",
  "forgot-password",
  "update-password",
  "family",
  "edubridge",
]);

/** Strip to kebab-case; append `-bridge` when missing. Empty when nothing usable remains. */
export function normalizeWorkspaceSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  if (!cleaned) return "";
  const withSuffix = cleaned.endsWith("-bridge") ? cleaned : `${cleaned}-bridge`;
  return withSuffix.slice(0, 120);
}

export function suggestSlugFromSchoolName(name: string): string {
  return normalizeWorkspaceSlug(name);
}

export function workspaceSlugError(slug: string): string | null {
  if (!slug) return "Pick a workspace name.";
  if (!slug.endsWith("-bridge")) return "Workspace URL must end with -bridge.";
  if (slug.length < 10) return "Workspace name is too short.";
  if (slug.length > 120) return "Workspace name is too long.";
  const body = slug.slice(0, -"-bridge".length);
  if (!SLUG_BODY.test(body)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }
  if (RESERVED_WORKSPACE_SLUGS.has(body) || RESERVED_WORKSPACE_SLUGS.has(slug)) {
    return "That workspace name is reserved. Try another.";
  }
  return null;
}
