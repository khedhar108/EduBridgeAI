import type { ModuleNavItem } from "./modules";

/** Workspace-prefixed path for a registry item. */
export function moduleHref(workspace: string, item: ModuleNavItem): string {
  const suffix = item.href === "/" ? "" : item.href;
  return `/${workspace}${suffix}`;
}

/** Longest matching module for the current pathname. */
export function findActiveModule(
  pathname: string,
  workspace: string,
  items: ModuleNavItem[],
): ModuleNavItem | null {
  const base = `/${workspace}`;
  if (!pathname.startsWith(base)) return null;

  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    const href = moduleHref(workspace, item);
    if (pathname === href) return item;
    if (item.href !== "/" && pathname.startsWith(`${href}/`)) return item;
  }

  return items.find((item) => item.id === "home") ?? null;
}

export function formatRoleLabel(role: string): string {
  return role.replace(/_/g, " ");
}
