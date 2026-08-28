import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { appRole } from "./roles";
import { schools } from "./schools";

/**
 * Membership is the normalized user ↔ school join. Its composite primary key
 * prevents duplicate memberships without a redundant surrogate identifier.
 */
export const schoolMembers = pgTable(
  "school_members",
  {
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: appRole("role").notNull(),
    /**
     * Soft access gate. Deactivation hides the member from RLS helpers
     * (is_school_member / has_school_role) on the next request — no session
     * revocation needed. Admins reactivate instead of re-inviting.
     */
    isActive: boolean("is_active").notNull().default(true),
    /**
     * Terminal archive. Distinct from is_active: archived members are never
     * reactivated through the toggle, stay in the directory for audit, and
     * fail RLS helpers (archived_at IS NULL required). No hard DELETE.
     */
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
    archivedBy: uuid("archived_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    /**
     * Per-school sign-in handle. Unique only within a school, so the same
     * handle can exist across different tenants. NULL until the user picks one.
     */
    username: varchar("username", { length: 32 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "school_members_school_id_user_id_pk",
      columns: [table.schoolId, table.userId],
    }),
    // The PK already indexes school_id as its leading column.
    index("school_members_user_id_idx").on(table.userId),
    index("school_members_school_id_role_idx").on(table.schoolId, table.role),
    uniqueIndex("school_members_school_username_unique")
      .on(table.schoolId, table.username)
      .where(sql`${table.username} is not null`),
    uniqueIndex("school_members_one_admin_per_school")
      .on(table.schoolId)
      .where(sql`${table.role} = 'school_admin' AND ${table.archivedAt} is null`),
    check(
      "school_members_username_format",
      sql`${table.username} is null or ${table.username} ~ '^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$'`,
    ),
    check(
      "school_members_platform_owner_forbidden",
      sql`${table.role} <> 'platform_owner'::app_role`,
    ),
    check(
      "school_members_archive_actor_required",
      sql`${table.archivedAt} is null or ${table.archivedBy} is not null`,
    ),
  ],
);

export type SchoolMember = typeof schoolMembers.$inferSelect;
export type NewSchoolMember = typeof schoolMembers.$inferInsert;
