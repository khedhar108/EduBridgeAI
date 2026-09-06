import {
  and,
  classEnrollments,
  classes,
  eq,
  ilike,
  inArray,
  sql,
  studentGuardians,
  students,
  type TenantTx,
} from "@repo/db";
import {
  DIRECTORY_PAGE_SIZE,
  directoryNamePattern,
  type DirectoryListInput,
} from "../lib/directory-list-query";
import type { DirectoryStudentRow } from "../types";
import { listAccessibleClassIds } from "./list-classes";

export type DirectoryListResult = {
  rows: DirectoryStudentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listDirectoryStudents(
  tx: TenantTx,
  schoolId: string,
  userId: string,
  role: string,
  input: DirectoryListInput = { page: 1 },
): Promise<DirectoryListResult> {
  const pageSize = DIRECTORY_PAGE_SIZE;
  const page = input.page;
  const scoped = role === "teacher" || role === "staff";
  const classIds = scoped
    ? await listAccessibleClassIds(tx, schoolId, userId, role)
    : [];
  if (scoped && classIds.length === 0) {
    return { rows: [], total: 0, page, pageSize };
  }

  const namePattern = input.name ? directoryNamePattern(input.name) : undefined;
  const filters = [eq(students.schoolId, schoolId)];
  if (scoped) {
    filters.push(inArray(classEnrollments.classId, classIds));
  }
  if (namePattern) {
    filters.push(ilike(students.fullName, namePattern));
  }
  const where = and(...filters);

  const countQuery = tx
    .select({
      total: sql<number>`cast(count(distinct ${students.id}) as int)`,
    })
    .from(students);
  const idQuery = tx
    .selectDistinct({
      id: students.id,
      fullName: students.fullName,
    })
    .from(students);

  const counted = scoped
    ? await countQuery
        .innerJoin(
          classEnrollments,
          and(
            eq(classEnrollments.studentId, students.id),
            eq(classEnrollments.schoolId, schoolId),
          ),
        )
        .where(where)
    : await countQuery.where(where);

  const total = counted[0]?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const idQueryScoped = scoped
    ? idQuery.innerJoin(
        classEnrollments,
        and(
          eq(classEnrollments.studentId, students.id),
          eq(classEnrollments.schoolId, schoolId),
        ),
      )
    : idQuery;

  const idRows = await idQueryScoped
    .where(where)
    .orderBy(students.fullName, students.id)
    .limit(pageSize)
    .offset(offset);

  const ids = idRows.map((row) => row.id);
  if (ids.length === 0) {
    return { rows: [], total, page, pageSize };
  }

  const detailRows = await tx
    .select({
      id: students.id,
      fullName: students.fullName,
      admissionNumber: students.admissionNumber,
      dateOfBirth: students.dateOfBirth,
      photoUrl: students.photoUrl,
      classLabel: students.classLabel,
      className: classes.name,
      classSection: classes.section,
      guardianName: studentGuardians.fullName,
    })
    .from(students)
    .leftJoin(
      classEnrollments,
      and(
        eq(classEnrollments.studentId, students.id),
        eq(classEnrollments.schoolId, schoolId),
      ),
    )
    .leftJoin(classes, eq(classes.id, classEnrollments.classId))
    .leftJoin(
      studentGuardians,
      and(
        eq(studentGuardians.studentId, students.id),
        eq(studentGuardians.isPrimary, true),
      ),
    )
    .where(inArray(students.id, ids))
    .orderBy(students.fullName);

  const byId = new Map<string, DirectoryStudentRow>();
  for (const row of detailRows) {
    if (byId.has(row.id)) continue;
    const classCaption = row.className
      ? `${row.className} ${row.classSection}`.trim()
      : (row.classLabel ?? "—");
    byId.set(row.id, {
      id: row.id,
      fullName: row.fullName,
      admissionNumber: row.admissionNumber,
      dateOfBirth: row.dateOfBirth,
      photoUrl: row.photoUrl,
      classCaption,
      guardianName: row.guardianName,
    });
  }

  const rows = ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [row] : [];
  });

  return { rows, total, page, pageSize };
}
