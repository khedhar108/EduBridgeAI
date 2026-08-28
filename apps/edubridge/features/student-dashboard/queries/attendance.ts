import {
  and,
  attendanceRecords,
  desc,
  eq,
  type TenantTx,
} from "@repo/db";

export type AttendanceRow = {
  studentId: string;
  status: "present" | "absent" | "late";
};

export async function listAttendanceForDate(
  tx: TenantTx,
  schoolId: string,
  classId: string,
  onDate: string,
): Promise<AttendanceRow[]> {
  const rows = await tx
    .select({
      studentId: attendanceRecords.studentId,
      status: attendanceRecords.status,
    })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.schoolId, schoolId),
        eq(attendanceRecords.classId, classId),
        eq(attendanceRecords.onDate, onDate),
      ),
    );

  return rows;
}

export async function getStudentAttendanceSummary(
  tx: TenantTx,
  schoolId: string,
  studentId: string,
): Promise<{ present: number; absent: number; late: number; total: number }> {
  const rows = await tx
    .select({
      status: attendanceRecords.status,
    })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.schoolId, schoolId),
        eq(attendanceRecords.studentId, studentId),
      ),
    );

  const present = rows.filter((row) => row.status === "present").length;
  const absent = rows.filter((row) => row.status === "absent").length;
  const late = rows.filter((row) => row.status === "late").length;
  return { present, absent, late, total: rows.length };
}

export type StudentAttendanceEntry = {
  onDate: string;
  status: "present" | "absent" | "late";
};

export async function listStudentAttendance(
  tx: TenantTx,
  schoolId: string,
  studentId: string,
): Promise<StudentAttendanceEntry[]> {
  return tx
    .select({
      onDate: attendanceRecords.onDate,
      status: attendanceRecords.status,
    })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.schoolId, schoolId),
        eq(attendanceRecords.studentId, studentId),
      ),
    )
    .orderBy(desc(attendanceRecords.onDate));
}
