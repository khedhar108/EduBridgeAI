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
 * internal FKs use `id`. Class membership is `class_enrollments`;
 * `class_label` stays as a denormalized display string.
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

/**
 * Sibling group for a parent family session. `family_id` is an opaque UUID
 * stored on the HMAC cookie — not an `auth.users` parent. Admin CRUD on
 * staff `/students` can list these later. Family writes use privileged `getDb()`.
 */
export const parentLinks = pgTable(
  "parent_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    familyId: uuid("family_id").notNull(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("parent_links_family_student_unique").on(
      table.schoolId,
      table.familyId,
      table.studentId,
    ),
    index("parent_links_school_id_idx").on(table.schoolId),
    index("parent_links_family_id_idx").on(table.familyId),
    index("parent_links_student_id_idx").on(table.studentId),
  ],
);

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type StudentGuardian = typeof studentGuardians.$inferSelect;
export type NewStudentGuardian = typeof studentGuardians.$inferInsert;
export type ParentLink = typeof parentLinks.$inferSelect;
export type NewParentLink = typeof parentLinks.$inferInsert;
