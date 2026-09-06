import {
  and,
  classEnrollments,
  classes,
  classStaffDelegations,
  classSubjects,
  eq,
  students,
  teacherAssignments,
  type TenantTx,
} from "@repo/db";

export type AccessibleClass = {
  id: string;
  name: string;
  section: string;
  academicYear: string;
};

/** Class ids this staff member may open. Admin and hub-granted roles see every class. */
export async function listAccessibleClassIds(
  tx: TenantTx,
  schoolId: string,
  userId: string,
  role: string,
): Promise<string[]> {
  if (role !== "teacher" && role !== "staff") {
    const rows = await tx
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.schoolId, schoolId));
    return rows.map((row) => row.id);
  }

  if (role === "teacher") {
    const rows = await tx
      .select({ classId: classSubjects.classId })
      .from(teacherAssignments)
      .innerJoin(
        classSubjects,
        eq(classSubjects.id, teacherAssignments.classSubjectId),
      )
      .where(
        and(
          eq(teacherAssignments.schoolId, schoolId),
          eq(teacherAssignments.teacherUserId, userId),
        ),
      );
    return [...new Set(rows.map((row) => row.classId))];
  }

  const rows = await tx
    .select({ classId: classStaffDelegations.classId })
    .from(classStaffDelegations)
    .where(
      and(
        eq(classStaffDelegations.schoolId, schoolId),
        eq(classStaffDelegations.userId, userId),
      ),
    );
  return rows.map((row) => row.classId);
}

export async function listAccessibleClasses(
  tx: TenantTx,
  schoolId: string,
): Promise<AccessibleClass[]> {
  const rows = await tx
    .select({
      id: classes.id,
      name: classes.name,
      section: classes.section,
      academicYear: classes.academicYear,
    })
    .from(classes)
    .where(eq(classes.schoolId, schoolId))
    .orderBy(classes.academicYear, classes.name, classes.section);

  return rows;
}

export type ClassRosterRow = {
  studentId: string;
  fullName: string;
  admissionNumber: string;
};

export async function listClassRoster(
  tx: TenantTx,
  schoolId: string,
  classId: string,
): Promise<ClassRosterRow[]> {
  const rows = await tx
    .select({
      studentId: students.id,
      fullName: students.fullName,
      admissionNumber: students.admissionNumber,
    })
    .from(classEnrollments)
    .innerJoin(students, eq(students.id, classEnrollments.studentId))
    .where(
      and(
        eq(classEnrollments.schoolId, schoolId),
        eq(classEnrollments.classId, classId),
      ),
    )
    .orderBy(students.fullName);

  return rows;
}

export async function getClassById(
  tx: TenantTx,
  schoolId: string,
  classId: string,
): Promise<AccessibleClass | null> {
  const rows = await tx
    .select({
      id: classes.id,
      name: classes.name,
      section: classes.section,
      academicYear: classes.academicYear,
    })
    .from(classes)
    .where(and(eq(classes.schoolId, schoolId), eq(classes.id, classId)))
    .limit(1);
  return rows[0] ?? null;
}

/** True when this staff user is assigned or delegated to the class. */
export async function staffCanEnterClass(
  tx: TenantTx,
  schoolId: string,
  classId: string,
  userId: string,
  role: string,
): Promise<boolean> {
  if (role === "school_admin") return true;

  if (role === "teacher") {
    const rows = await tx
      .select({ id: teacherAssignments.id })
      .from(teacherAssignments)
      .innerJoin(
        classSubjects,
        eq(classSubjects.id, teacherAssignments.classSubjectId),
      )
      .where(
        and(
          eq(teacherAssignments.schoolId, schoolId),
          eq(teacherAssignments.teacherUserId, userId),
          eq(classSubjects.classId, classId),
        ),
      )
      .limit(1);
    return Boolean(rows[0]);
  }

  if (role === "staff") {
    const rows = await tx
      .select({ id: classStaffDelegations.id })
      .from(classStaffDelegations)
      .where(
        and(
          eq(classStaffDelegations.schoolId, schoolId),
          eq(classStaffDelegations.classId, classId),
          eq(classStaffDelegations.userId, userId),
        ),
      )
      .limit(1);
    return Boolean(rows[0]);
  }

  return false;
}
