import { pgEnum } from "drizzle-orm/pg-core";

/**
 * The global platform owner value is reserved here for stable typing, but a
 * database check forbids it in `school_members`. Platform owners are trusted
 * global principals, never tenant memberships.
 */
export const appRoleValues = [
  "platform_owner",
  "school_admin",
  "coordinator",
  "accountant",
  "teacher",
  "staff",
  "student",
  "parent",
] as const;

export type AppRole = (typeof appRoleValues)[number];
export type SchoolRole = Exclude<AppRole, "platform_owner">;

export const appRole = pgEnum("app_role", appRoleValues);
