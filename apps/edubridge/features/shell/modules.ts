/**
 * Platform roles — keep in sync with Phase 0 enum in @repo/db.
 */
export const PLATFORM_ROLES = [
  "platform_owner",
  "school_admin",
  "teacher",
  "staff",
  "student",
  "parent",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type ModuleNavItem = {
  id: string;
  title: string;
  href: string;
  /** Lucide icon name or component key — resolved in shell UI later. */
  icon: string;
  allowedRoles: PlatformRole[];
};

/**
 * Single source of navigation. Phase 0+ modules append here only.
 */
export const modules: ModuleNavItem[] = [
  {
    id: "home",
    title: "Home",
    href: "/",
    icon: "home",
    allowedRoles: [
      "school_admin",
      "teacher",
      "staff",
      "student",
      "parent",
    ],
  },
];

export function modulesForRole(role: PlatformRole): ModuleNavItem[] {
  return modules.filter((item) => item.allowedRoles.includes(role));
}
