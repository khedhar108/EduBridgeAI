import { cache } from "react";
import {
  activities,
  and,
  assessments,
  attendanceRecords,
  classEnrollments,
  classSubjects,
  desc,
  eq,
  getDb,
  isNull,
  marks,
  or,
  subjects,
} from "@repo/db";

export type FamilyAttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  total: number;
  percentPresent: number;
};

export const getFamilyAttendanceSummary = cache(
  async (
    schoolId: string,
    studentId: string,
  ): Promise<FamilyAttendanceSummary | null> => {
    const db = getDb();
    const rows = await db
      .select({ status: attendanceRecords.status })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.schoolId, schoolId),
          eq(attendanceRecords.studentId, studentId),
        ),
      );

    if (rows.length === 0) return null;

    const present = rows.filter((row) => row.status === "present").length;
    const absent = rows.filter((row) => row.status === "absent").length;
    const late = rows.filter((row) => row.status === "late").length;
    const total = rows.length;
    return {
      present,
      absent,
      late,
      total,
      percentPresent: Math.round(((present + late) / total) * 100),
    };
  },
);

export type FamilyExamMark = {
  assessmentName: string;
  type: "periodic" | "term" | "other";
  subjectName: string;
  score: number;
  maxMarks: number;
  onDate: string;
};

export const getFamilyExamMarks = cache(
  async (
    schoolId: string,
    studentId: string,
  ): Promise<FamilyExamMark[]> => {
    const db = getDb();
    const rows = await db
      .select({
        assessmentName: assessments.name,
        type: assessments.type,
        subjectName: subjects.name,
        score: marks.score,
        maxMarks: assessments.maxMarks,
        onDate: assessments.onDate,
      })
      .from(marks)
      .innerJoin(assessments, eq(marks.assessmentId, assessments.id))
      .innerJoin(
        classSubjects,
        eq(assessments.classSubjectId, classSubjects.id),
      )
      .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
      .where(
        and(eq(marks.schoolId, schoolId), eq(marks.studentId, studentId)),
      )
      .orderBy(desc(assessments.onDate));

    return rows;
  },
);

export type FamilyEvent = {
  id: string;
  category: string;
  note: string;
  occurredOn: string;
};

export const getFamilyEvents = cache(
  async (
    schoolId: string,
    studentId: string,
  ): Promise<FamilyEvent[]> => {
    const db = getDb();
    const enrollment = await db
      .select({ classId: classEnrollments.classId })
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.schoolId, schoolId),
          eq(classEnrollments.studentId, studentId),
        ),
      )
      .limit(1);

    const classId = enrollment[0]?.classId;
    if (!classId) return [];

    const rows = await db
      .select({
        id: activities.id,
        category: activities.category,
        note: activities.note,
        occurredOn: activities.occurredOn,
      })
      .from(activities)
      .where(
        and(
          eq(activities.schoolId, schoolId),
          eq(activities.classId, classId),
          or(isNull(activities.studentId), eq(activities.studentId, studentId)),
        ),
      )
      .orderBy(desc(activities.occurredOn));

    return rows;
  },
);
