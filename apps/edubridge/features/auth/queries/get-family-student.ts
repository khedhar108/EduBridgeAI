import { cache } from "react";
import { and, eq, getDb, inArray, students } from "@repo/db";

export type FamilyStudentPreview = {
  id: string;
  fullName: string;
  admissionNumber: string;
  classLabel: string | null;
};

export const getFamilyStudentPreview = cache(
  async (
    schoolId: string,
    studentId: string,
  ): Promise<FamilyStudentPreview | null> => {
    const db = getDb();
    const rows = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        admissionNumber: students.admissionNumber,
        classLabel: students.classLabel,
      })
      .from(students)
      .where(
        and(eq(students.schoolId, schoolId), eq(students.id, studentId)),
      )
      .limit(1);

    return rows[0] ?? null;
  },
);

export const listFamilyStudentPreviews = cache(
  async (
    schoolId: string,
    studentIds: string[],
  ): Promise<FamilyStudentPreview[]> => {
    if (studentIds.length === 0) return [];
    const db = getDb();
    const rows = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        admissionNumber: students.admissionNumber,
        classLabel: students.classLabel,
      })
      .from(students)
      .where(
        and(eq(students.schoolId, schoolId), inArray(students.id, studentIds)),
      );

    const byId = new Map(rows.map((row) => [row.id, row]));
    return studentIds.flatMap((id) => {
      const row = byId.get(id);
      if (!row) return [];
      return [
        {
          id: row.id,
          fullName: row.fullName,
          admissionNumber: row.admissionNumber,
          classLabel: row.classLabel,
        },
      ];
    });
  },
);
