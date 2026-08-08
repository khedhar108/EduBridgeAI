import { sql } from "drizzle-orm";
import {
  check,
  index,
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
 * Invite-only membership. Role comes from this row at accept time — never
 * from client input. Token is opaque; accept path validates unused + unexpired.
 */
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    role: appRole("role").notNull(),
    token: varchar("token", { length: 64 }).notNull(),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    acceptedAt: timestamp("accepted_at", {
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
    uniqueIndex("invitations_token_unique").on(table.token),
    uniqueIndex("invitations_school_email_pending_unique")
      .on(table.schoolId, table.email)
      .where(sql`${table.acceptedAt} is null`),
    index("invitations_school_id_idx").on(table.schoolId),
    index("invitations_email_idx").on(table.email),
    check(
      "invitations_platform_owner_forbidden",
      sql`${table.role} <> 'platform_owner'::app_role`,
    ),
    check(
      "invitations_email_lowercase",
      sql`${table.email} = lower(${table.email})`,
    ),
  ],
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
