import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
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

export const attendanceStatusValues = ["present", "absent", "late"] as const;
export type AttendanceStatus = (typeof attendanceStatusValues)[number];
export const attendanceStatus = pgEnum(
  "attendance_status",
  attendanceStatusValues,
);

export const assessmentTypeValues = ["periodic", "term", "other"] as const;
export type AssessmentType = (typeof assessmentTypeValues)[number];
export const assessmentType = pgEnum("assessment_type", assessmentTypeValues);

export const shareChannelValues = ["whatsapp"] as const;
export type ShareChannel = (typeof shareChannelValues)[number];
export const shareChannel = pgEnum("share_channel", shareChannelValues);

export const shareRequestStatusValues = ["pending", "sent", "failed"] as const;
export type ShareRequestStatus = (typeof shareRequestStatusValues)[number];
export const shareRequestStatus = pgEnum(
  "share_request_status",
  shareRequestStatusValues,
);

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    section: varchar("section", { length: 16 }).notNull().default("A"),
    academicYear: varchar("academic_year", { length: 16 }).notNull(),
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
    uniqueIndex("classes_school_year_name_section_unique").on(
      table.schoolId,
      table.academicYear,
      table.name,
      table.section,
    ),
    index("classes_school_id_idx").on(table.schoolId),
    check(
      "classes_name_not_blank",
      sql`length(btrim(${table.name})) between 1 and 64`,
    ),
    check(
      "classes_section_not_blank",
      sql`length(btrim(${table.section})) between 1 and 16`,
    ),
    check(
      "classes_academic_year_not_blank",
      sql`length(btrim(${table.academicYear})) between 4 and 16`,
    ),
  ],
);

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    code: varchar("code", { length: 16 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("subjects_school_name_unique").on(table.schoolId, table.name),
    index("subjects_school_id_idx").on(table.schoolId),
    check(
      "subjects_name_not_blank",
      sql`length(btrim(${table.name})) between 2 and 80`,
    ),
  ],
);

export const classSubjects = pgTable(
  "class_subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("class_subjects_class_subject_unique").on(
      table.schoolId,
      table.classId,
      table.subjectId,
    ),
    index("class_subjects_school_id_idx").on(table.schoolId),
    index("class_subjects_class_id_idx").on(table.classId),
    index("class_subjects_subject_id_idx").on(table.subjectId),
  ],
);

export const teacherAssignments = pgTable(
  "teacher_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classSubjectId: uuid("class_subject_id")
      .notNull()
      .references(() => classSubjects.id, { onDelete: "cascade" }),
    teacherUserId: uuid("teacher_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("teacher_assignments_offering_teacher_unique").on(
      table.schoolId,
      table.classSubjectId,
      table.teacherUserId,
    ),
    index("teacher_assignments_school_id_idx").on(table.schoolId),
    index("teacher_assignments_teacher_user_id_idx").on(table.teacherUserId),
    index("teacher_assignments_class_subject_id_idx").on(table.classSubjectId),
  ],
);

export const classStaffDelegations = pgTable(
  "class_staff_delegations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("class_staff_delegations_class_user_unique").on(
      table.schoolId,
      table.classId,
      table.userId,
    ),
    index("class_staff_delegations_school_id_idx").on(table.schoolId),
    index("class_staff_delegations_class_id_idx").on(table.classId),
    index("class_staff_delegations_user_id_idx").on(table.userId),
  ],
);

export const classEnrollments = pgTable(
  "class_enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
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
    uniqueIndex("class_enrollments_class_student_unique").on(
      table.schoolId,
      table.classId,
      table.studentId,
    ),
    index("class_enrollments_school_id_idx").on(table.schoolId),
    index("class_enrollments_class_id_idx").on(table.classId),
    index("class_enrollments_student_id_idx").on(table.studentId),
  ],
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    onDate: date("on_date", { mode: "string" }).notNull(),
    status: attendanceStatus("status").notNull(),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
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
    uniqueIndex("attendance_records_class_student_date_unique").on(
      table.schoolId,
      table.classId,
      table.studentId,
      table.onDate,
    ),
    index("attendance_records_school_id_idx").on(table.schoolId),
    index("attendance_records_class_date_idx").on(table.classId, table.onDate),
    index("attendance_records_student_id_idx").on(table.studentId),
  ],
);

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    classSubjectId: uuid("class_subject_id")
      .notNull()
      .references(() => classSubjects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    type: assessmentType("type").notNull(),
    maxMarks: integer("max_marks").notNull(),
    onDate: date("on_date", { mode: "string" }).notNull(),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
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
    index("assessments_school_id_idx").on(table.schoolId),
    index("assessments_class_id_idx").on(table.classId),
    index("assessments_class_subject_id_idx").on(table.classSubjectId),
    check(
      "assessments_name_not_blank",
      sql`length(btrim(${table.name})) between 2 and 160`,
    ),
    check("assessments_max_marks_positive", sql`${table.maxMarks} > 0`),
  ],
);

export const marks = pgTable(
  "marks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
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
    uniqueIndex("marks_assessment_student_unique").on(
      table.schoolId,
      table.assessmentId,
      table.studentId,
    ),
    index("marks_school_id_idx").on(table.schoolId),
    index("marks_class_id_idx").on(table.classId),
    index("marks_student_id_idx").on(table.studentId),
    check("marks_score_non_negative", sql`${table.score} >= 0`),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    /** Null = class-wide (family Events). Set = one child observation. */
    studentId: uuid("student_id").references(() => students.id, {
      onDelete: "cascade",
    }),
    category: varchar("category", { length: 64 }).notNull(),
    note: text("note").notNull(),
    occurredOn: date("occurred_on", { mode: "string" }).notNull(),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
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
    index("activities_school_id_idx").on(table.schoolId),
    index("activities_class_id_idx").on(table.classId),
    index("activities_student_id_idx").on(table.studentId),
    check(
      "activities_category_not_blank",
      sql`length(btrim(${table.category})) between 2 and 64`,
    ),
    check(
      "activities_note_not_blank",
      sql`length(btrim(${table.note})) between 2 and 4000`,
    ),
  ],
);

export const shareRequests = pgTable(
  "share_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    requestedBy: uuid("requested_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    channel: shareChannel("channel").notNull().default("whatsapp"),
    status: shareRequestStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("share_requests_school_id_idx").on(table.schoolId),
    index("share_requests_student_id_idx").on(table.studentId),
  ],
);

export type ClassRow = typeof classes.$inferSelect;
export type NewClassRow = typeof classes.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type ClassSubject = typeof classSubjects.$inferSelect;
export type TeacherAssignment = typeof teacherAssignments.$inferSelect;
export type ClassStaffDelegation = typeof classStaffDelegations.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Mark = typeof marks.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type ShareRequest = typeof shareRequests.$inferSelect;
