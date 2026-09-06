/**
 * Platform roles — keep in sync with Phase 0 enum in @repo/db.
 */
export const PLATFORM_ROLES = [
  "platform_owner",
  "school_admin",
  "coordinator",
  "accountant",
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
      "accountant",
      "teacher",
      "staff",
      "student",
      "parent",
    ],
  },
  {
    id: "fees",
    title: "Fees",
    href: "/fees",
    icon: "wallet",
    allowedRoles: ["school_admin", "accountant", "coordinator"],
  },
  {
    id: "students",
    title: "Students",
    href: "/students",
    icon: "graduation-cap",
    allowedRoles: ["school_admin", "teacher", "staff"],
  },
  {
    id: "control",
    title: "Control Hub",
    href: "/settings/control",
    icon: "sliders-horizontal",
    allowedRoles: ["school_admin"],
  },
  {
    id: "team",
    title: "Team",
    href: "/settings/team",
    icon: "users",
    allowedRoles: ["school_admin", "coordinator"],
  },
];

/**
 * Family chrome only. Cookie Path is `/family` — these hrefs must stay under it.
 * `allowedRoles` is documentary; FamilyShell already proved the cookie.
 */
export const familyModules: ModuleNavItem[] = [
  {
    id: "family-home",
    title: "Home",
    href: "/family/home",
    icon: "home",
    allowedRoles: ["student", "parent"],
  },
  {
    id: "family-fees",
    title: "Fees",
    href: "/family/fees",
    icon: "wallet",
    allowedRoles: ["student", "parent"],
  },
  {
    id: "family-progress",
    title: "Progress",
    href: "/family/progress",
    icon: "chart",
    allowedRoles: ["student", "parent"],
  },
  {
    id: "family-exams",
    title: "Exams",
    href: "/family/exams",
    icon: "book",
    allowedRoles: ["student", "parent"],
  },
  {
    id: "family-events",
    title: "Events",
    href: "/family/events",
    icon: "calendar",
    allowedRoles: ["student", "parent"],
  },
];

export function modulesForRole(role: PlatformRole): ModuleNavItem[] {
  return modules.filter((item) => item.allowedRoles.includes(role));
}
