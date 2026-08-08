import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { appRole } from "./roles";
import { schools } from "./schools";

/**
 * Domain-join queue. Teacher/staff whose email domain matches
 * `schools.official_email_domain` land here until school_admin activates them.
 * Activation creates `school_members`; role is chosen by the admin, never the client.
 */
export const membershipRequestStatus = pgEnum("membership_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const membershipRequests = pgTable(
  "membership_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    status: membershipRequestStatus("status").notNull().default("pending"),
    /** Set when approved — mirrors school_members.role; never platform_owner. */
    activatedRole: appRole("activated_role"),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", {
      withTimezone: true,
      mode: "date",
    }),
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
    uniqueIndex("membership_requests_school_user_pending_unique")
      .on(table.schoolId, table.userId)
      .where(sql`${table.status} = 'pending'`),
    index("membership_requests_school_status_idx").on(
      table.schoolId,
      table.status,
    ),
    index("membership_requests_user_id_idx").on(table.userId),
    check(
      "membership_requests_email_lowercase",
      sql`${table.email} = lower(${table.email})`,
    ),
    check(
      "membership_requests_activated_role_not_owner",
      sql`${table.activatedRole} is null or ${table.activatedRole} <> 'platform_owner'::app_role`,
    ),
  ],
);

export type MembershipRequest = typeof membershipRequests.$inferSelect;
export type NewMembershipRequest = typeof membershipRequests.$inferInsert;
