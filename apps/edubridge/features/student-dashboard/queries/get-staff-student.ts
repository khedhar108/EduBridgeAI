import {
  and,
  classEnrollments,
  classes,
  eq,
  students,
  type TenantTx,
} from "@repo/db";
import { staffCanEnterClass } from "./list-classes";

export type StaffStudentDetail = {
  id: string;
  fullName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  classSection: string;
  academicYear: string;
};

export async function getStaffStudent(
  tx: TenantTx,
  schoolId: string,
  studentId: string,
  userId: string,
  role: string,
): Promise<StaffStudentDetail | null> {
  const rows = await tx
    .select({
      id: students.id,
      fullName: students.fullName,
      admissionNumber: students.admissionNumber,
      classId: classes.id,
      className: classes.name,
      classSection: classes.section,
      academicYear: classes.academicYear,
    })
    .from(classEnrollments)
    .innerJoin(students, eq(students.id, classEnrollments.studentId))
    .innerJoin(classes, eq(classes.id, classEnrollments.classId))
    .where(
      and(
        eq(classEnrollments.schoolId, schoolId),
        eq(classEnrollments.studentId, studentId),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const allowed = await staffCanEnterClass(
    tx,
    schoolId,
    row.classId,
    userId,
    role,
  );
  if (!allowed) return null;

  return row;
}
