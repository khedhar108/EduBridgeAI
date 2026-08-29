import { sql } from "drizzle-orm";
import {
  check,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * One row per tenant. The human-facing workspace identifier is `slug`; UUIDs
 * remain opaque internal identifiers shared by every future tenant table.
 */
export const schools = pgTable(
  "schools",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    officialEmailDomain: varchar("official_email_domain", {
      length: 253,
    }).notNull(),
    /** ISO 3166-1 alpha-2. Founder wizard defaults to India. */
    country: varchar("country", { length: 2 }).notNull().default("IN"),
    state: varchar("state", { length: 80 }),
    city: varchar("city", { length: 80 }),
    pincode: varchar("pincode", { length: 6 }),
    /** Sparse Hub overrides: capability → role list. Missing key = default. */
    capabilityOverrides: jsonb("capability_overrides")
      .$type<Record<string, string[]>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
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
    uniqueIndex("schools_slug_unique").on(table.slug),
    uniqueIndex("schools_official_email_domain_unique").on(
      table.officialEmailDomain,
    ),
    check(
      "schools_name_not_blank",
      sql`length(btrim(${table.name})) between 2 and 160`,
    ),
    check(
      "schools_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*-bridge$'`,
    ),
    check(
      "schools_email_domain_format",
      sql`${table.officialEmailDomain} = lower(${table.officialEmailDomain})
        and ${table.officialEmailDomain} ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$'`,
    ),
    check(
      "schools_country_format",
      sql`${table.country} ~ '^[A-Z]{2}$'`,
    ),
    check(
      "schools_state_not_blank",
      sql`${table.state} is null or length(btrim(${table.state})) between 2 and 80`,
    ),
    check(
      "schools_city_not_blank",
      sql`${table.city} is null or length(btrim(${table.city})) between 2 and 80`,
    ),
    check(
      "schools_pincode_format",
      sql`${table.pincode} is null or ${table.pincode} ~ '^[0-9]{6}$'`,
    ),
  ],
);

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
