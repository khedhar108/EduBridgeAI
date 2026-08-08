import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
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
    check(
      "school_members_platform_owner_forbidden",
      sql`${table.role} <> 'platform_owner'::app_role`,
    ),
  ],
);

export type SchoolMember = typeof schoolMembers.$inferSelect;
export type NewSchoolMember = typeof schoolMembers.$inferInsert;
