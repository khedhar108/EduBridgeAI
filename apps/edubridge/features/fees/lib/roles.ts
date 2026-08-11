import type { SchoolRole } from "@repo/db";

/** Money-flow roles: fee structures, scholarships, collections, audit. */
export const MONEY_ROLES: SchoolRole[] = ["school_admin", "accountant"];

export function isMoneyRole(role: SchoolRole): boolean {
  return MONEY_ROLES.includes(role);
}
