import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Application profile keyed by the matching Supabase `auth.users.id`.
 *
 * The external-schema FK is appended to the generated SQL migration because
 * Drizzle must not attempt to own or recreate Supabase's `auth.users` table.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    /**
     * Denormalized from auth.users so member directories can render emails
     * through Drizzle + RLS. Kept in sync at signup/invite/activate time;
     * auth.users remains the identity source of truth.
     */
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 32 }),
    avatarUrl: text("avatar_url"),
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
    check(
      "profiles_full_name_not_blank",
      sql`length(btrim(${table.fullName})) between 2 and 160`,
    ),
    check(
      "profiles_phone_not_blank",
      sql`${table.phone} is null or length(btrim(${table.phone})) > 0`,
    ),
    check(
      "profiles_email_lowercase",
      sql`${table.email} is null or ${table.email} = lower(${table.email})`,
    ),
    uniqueIndex("profiles_email_unique").on(table.email),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
