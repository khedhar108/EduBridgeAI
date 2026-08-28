import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { schools } from "./schools";

/**
 * Append-only privileged-action history for a school: role grants, member
 * activation changes, impersonation sessions. Never update or delete from
 * app code. Mirrors the fee_audit_events pattern.
 */
export const adminAuditEvents = pgTable(
  "admin_audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: uuid("entity_id"),
    /** Member the action targeted, when applicable (activate, login-as, …). */
    targetUserId: uuid("target_user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("admin_audit_events_school_created_idx").on(
      table.schoolId,
      table.createdAt,
    ),
    check(
      "admin_audit_events_action_not_blank",
      sql`length(btrim(${table.action})) between 2 and 64`,
    ),
  ],
);

export type AdminAuditEvent = typeof adminAuditEvents.$inferSelect;
export type NewAdminAuditEvent = typeof adminAuditEvents.$inferInsert;
