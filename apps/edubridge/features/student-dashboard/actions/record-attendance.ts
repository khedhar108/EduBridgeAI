"use server";

import { revalidatePath } from "next/cache";
import { attendanceRecords, withTenant } from "@repo/db";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { listClassRoster, staffCanEnterClass } from "../queries/list-classes";
import { recordAttendanceSchema } from "../lib/schemas";

export type RecordAttendanceState = { error?: string; ok?: boolean };

export async function recordAttendanceAction(
  workspace: string,
  _prev: RecordAttendanceState,
  formData: FormData,
): Promise<RecordAttendanceState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  if (!can(ctx, "students.recordAttendance")) {
    return { error: "You cannot mark this register." };
  }

  const recordsRaw = formData.get("records");
  let records: unknown = [];
  try {
    records = typeof recordsRaw === "string" ? JSON.parse(recordsRaw) : [];
  } catch {
    return { error: "Check the class, date, and every pupil’s mark." };
  }
  const parsed = recordAttendanceSchema.safeParse({
    classId: formData.get("classId"),
    onDate: formData.get("onDate"),
    records,
  });
  if (!parsed.success) {
    return { error: "Check the class, date, and every pupil’s mark." };
  }

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        const allowed = await staffCanEnterClass(
          tx,
          ctx.schoolId,
          parsed.data.classId,
          ctx.userId,
          ctx.role,
        );
        if (!allowed) {
          throw new Error("This class is not assigned to you.");
        }

        const roster = await listClassRoster(
          tx,
          ctx.schoolId,
          parsed.data.classId,
        );
        const rosterIds = new Set(roster.map((row) => row.studentId));
        for (const record of parsed.data.records) {
          if (!rosterIds.has(record.studentId)) {
            throw new Error("A pupil is not on this class register.");
          }
        }

        const now = new Date();
        for (const record of parsed.data.records) {
          await tx
            .insert(attendanceRecords)
            .values({
              schoolId: ctx.schoolId,
              classId: parsed.data.classId,
              studentId: record.studentId,
              onDate: parsed.data.onDate,
              status: record.status,
              createdBy: ctx.userId,
              updatedBy: ctx.userId,
            })
            .onConflictDoUpdate({
              target: [
                attendanceRecords.schoolId,
                attendanceRecords.classId,
                attendanceRecords.studentId,
                attendanceRecords.onDate,
              ],
              set: {
                status: record.status,
                updatedBy: ctx.userId,
                updatedAt: now,
              },
            });
        }
      },
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not save attendance.",
    };
  }

  revalidatePath(`/${workspace}/students`);
  return { ok: true };
}
