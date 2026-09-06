import {
  and,
  classEnrollments,
  classes,
  desc,
  eq,
  studentGuardians,
  students,
  type TenantTx,
} from "@repo/db";
import { staffCanEnterClass } from "./list-classes";

export type StaffGuardian = {
  fullName: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
};

export type StaffStudentDetail = {
  id: string;
  fullName: string;
  admissionNumber: string;
  dateOfBirth: string;
  photoUrl: string | null;
  classId: string | null;
  className: string | null;
  classSection: string | null;
  academicYear: string | null;
  guardians: StaffGuardian[];
};

export async function getStaffStudent(
  tx: TenantTx,
  schoolId: string,
  studentId: string,
  userId: string,
  role: string,
): Promise<StaffStudentDetail | null> {
  const pupilRows = await tx
    .select({
      id: students.id,
      fullName: students.fullName,
      admissionNumber: students.admissionNumber,
      dateOfBirth: students.dateOfBirth,
      photoUrl: students.photoUrl,
    })
    .from(students)
    .where(and(eq(students.schoolId, schoolId), eq(students.id, studentId)))
    .limit(1);

  const pupil = pupilRows[0];
  if (!pupil) return null;

  const enrollmentRows = await tx
    .select({
      classId: classes.id,
      className: classes.name,
      classSection: classes.section,
      academicYear: classes.academicYear,
    })
    .from(classEnrollments)
    .innerJoin(classes, eq(classes.id, classEnrollments.classId))
    .where(
      and(
        eq(classEnrollments.schoolId, schoolId),
        eq(classEnrollments.studentId, studentId),
      ),
    )
    .limit(1);

  const enrollment = enrollmentRows[0];
  if (enrollment) {
    const allowed = await staffCanEnterClass(
      tx,
      schoolId,
      enrollment.classId,
      userId,
      role,
    );
    if (!allowed) return null;
  } else if (role === "teacher" || role === "staff") {
    return null;
  }

  const guardians = await tx
    .select({
      fullName: studentGuardians.fullName,
      relationship: studentGuardians.relationship,
      phone: studentGuardians.phone,
      email: studentGuardians.email,
      isPrimary: studentGuardians.isPrimary,
    })
    .from(studentGuardians)
    .where(
      and(
        eq(studentGuardians.schoolId, schoolId),
        eq(studentGuardians.studentId, studentId),
      ),
    )
    .orderBy(desc(studentGuardians.isPrimary), studentGuardians.fullName);

  return {
    ...pupil,
    classId: enrollment?.classId ?? null,
    className: enrollment?.className ?? null,
    classSection: enrollment?.classSection ?? null,
    academicYear: enrollment?.academicYear ?? null,
    guardians,
  };
}
