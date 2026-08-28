import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { schools } from "./schools";
import { students } from "./students";

export const feePaymentModeValues = [
  "once",
  "quarterly",
  "custom",
] as const;
export type FeePaymentMode = (typeof feePaymentModeValues)[number];
export const feePaymentMode = pgEnum("fee_payment_mode", feePaymentModeValues);

export const feePaymentMethodValues = [
  "cash",
  "upi",
  "bank_transfer",
  "cheque",
  "other",
] as const;
export type FeePaymentMethod = (typeof feePaymentMethodValues)[number];
export const feePaymentMethod = pgEnum(
  "fee_payment_method",
  feePaymentMethodValues,
);

export type FeeHead = {
  code: string;
  label: string;
  amountInr: number;
};

/**
 * Mutable label for a school's fee structure. Amounts never live here —
 * every published change is a new `fee_plan_versions` row.
 */
export const feePlans = pgTable(
  "fee_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    classLabel: varchar("class_label", { length: 64 }),
    paymentMode: feePaymentMode("payment_mode").notNull().default("once"),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
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
    index("fee_plans_school_id_idx").on(table.schoolId),
    check(
      "fee_plans_name_not_blank",
      sql`length(btrim(${table.name})) between 2 and 160`,
    ),
  ],
);

/**
 * Immutable amount snapshot. Edits create a new row; existing student
 * assignments keep pointing at the version they registered under.
 */
export const feePlanVersions = pgTable(
  "fee_plan_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => feePlans.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    paymentMode: feePaymentMode("payment_mode").notNull(),
    heads: jsonb("heads").$type<FeeHead[]>().notNull(),
    totalAmountInr: integer("total_amount_inr").notNull(),
    note: text("note"),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("fee_plan_versions_plan_version_unique").on(
      table.planId,
      table.version,
    ),
    index("fee_plan_versions_school_id_idx").on(table.schoolId),
    check(
      "fee_plan_versions_version_positive",
      sql`${table.version} > 0`,
    ),
    check(
      "fee_plan_versions_total_non_negative",
      sql`${table.totalAmountInr} >= 0`,
    ),
  ],
);

/**
 * Pins a student to one fee-plan version at registration. Concession
 * percent is 0–100 (scholarship). Changing school fee plans never
 * rewrites this row.
 */
export const studentFeeAssignments = pgTable(
  "student_fee_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    planVersionId: uuid("plan_version_id")
      .notNull()
      .references(() => feePlanVersions.id, { onDelete: "restrict" }),
    concessionPercent: integer("concession_percent").notNull().default(0),
    concessionNote: text("concession_note"),
    assignedBy: uuid("assigned_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("student_fee_assignments_student_unique").on(table.studentId),
    index("student_fee_assignments_school_id_idx").on(table.schoolId),
    check(
      "student_fee_assignments_concession_range",
      sql`${table.concessionPercent} between 0 and 100`,
    ),
  ],
);

export const feePayments = pgTable(
  "fee_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => studentFeeAssignments.id, { onDelete: "restrict" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    amountInr: integer("amount_inr").notNull(),
    method: feePaymentMethod("method").notNull().default("cash"),
    reference: varchar("reference", { length: 120 }),
    note: text("note"),
    paidAt: timestamp("paid_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    recordedBy: uuid("recorded_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("fee_payments_school_id_idx").on(table.schoolId),
    index("fee_payments_student_id_idx").on(table.studentId),
    index("fee_payments_assignment_id_idx").on(table.assignmentId),
    check(
      "fee_payments_amount_positive",
      sql`${table.amountInr} > 0`,
    ),
  ],
);

/** Append-only money-structure history. Never update or delete from app code. */
export const feeAuditEvents = pgTable(
  "fee_audit_events",
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
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("fee_audit_events_school_created_idx").on(
      table.schoolId,
      table.createdAt,
    ),
  ],
);

export type FeePlan = typeof feePlans.$inferSelect;
export type NewFeePlan = typeof feePlans.$inferInsert;
export type FeePlanVersion = typeof feePlanVersions.$inferSelect;
export type NewFeePlanVersion = typeof feePlanVersions.$inferInsert;
export type StudentFeeAssignment = typeof studentFeeAssignments.$inferSelect;
export type FeePayment = typeof feePayments.$inferSelect;
export type FeeAuditEvent = typeof feeAuditEvents.$inferSelect;
