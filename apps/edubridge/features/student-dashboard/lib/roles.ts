import type { SchoolRole } from "@repo/db";

export const STUDENT_DASHBOARD_ROLES: SchoolRole[] = [
  "school_admin",
  "teacher",
  "staff",
];

export function isStudentDashboardRole(role: SchoolRole): boolean {
  return STUDENT_DASHBOARD_ROLES.includes(role);
}

export const ATTENDANCE_ENTRY_ROLES: SchoolRole[] = [
  "school_admin",
  "teacher",
  "staff",
];
