import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { schools } from "./schools";

/**
 * Core student record. Admission number is the human key per school;
 * internal FKs use `id`. Full academic structure (classes, enrollments)
 * lands with Phase 1 dashboard — this table is enough to pin fees.
 */
export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    admissionNumber: varchar("admission_number", { length: 64 }).notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    photoUrl: text("photo_url"),
    classLabel: varchar("class_label", { length: 64 }),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "set null",
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
    uniqueIndex("students_school_admission_number_unique").on(
      table.schoolId,
      table.admissionNumber,
    ),
    index("students_school_id_idx").on(table.schoolId),
    check(
      "students_full_name_not_blank",
      sql`length(btrim(${table.fullName})) between 2 and 160`,
    ),
    check(
      "students_admission_number_not_blank",
      sql`length(btrim(${table.admissionNumber})) > 0`,
    ),
  ],
);

export const studentGuardians = pgTable(
  "student_guardians",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    relationship: varchar("relationship", { length: 64 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    email: varchar("email", { length: 320 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("student_guardians_student_id_idx").on(table.studentId),
    index("student_guardians_school_id_idx").on(table.schoolId),
    check(
      "student_guardians_full_name_not_blank",
      sql`length(btrim(${table.fullName})) between 2 and 160`,
    ),
  ],
);

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type StudentGuardian = typeof studentGuardians.$inferSelect;
export type NewStudentGuardian = typeof studentGuardians.$inferInsert;
