"use server";

import { revalidatePath } from "next/cache";
import {
  and,
  eq,
  feeAuditEvents,
  feePlanVersions,
  studentFeeAssignments,
  studentGuardians,
  students,
  withTenant,
} from "@repo/db";
import {
  assertRole,
  getSessionContext,
} from "@/lib/tenancy/session-context";
import { MONEY_ROLES } from "../lib/roles";
import { registerStudentSchema } from "../lib/schemas";

export type RegisterStudentState = { error?: string; ok?: boolean };

export async function registerStudentAction(
  workspace: string,
  _prev: RegisterStudentState,
  formData: FormData,
): Promise<RegisterStudentState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  assertRole(ctx, MONEY_ROLES);

  const parsed = registerStudentSchema.safeParse({
    admissionNumber: formData.get("admissionNumber"),
    fullName: formData.get("fullName"),
    dateOfBirth: formData.get("dateOfBirth"),
    classLabel: formData.get("classLabel") ?? "",
    guardianName: formData.get("guardianName"),
    guardianRelationship: formData.get("guardianRelationship"),
    guardianPhone: formData.get("guardianPhone") ?? "",
    planVersionId: formData.get("planVersionId"),
    concessionPercent: formData.get("concessionPercent") ?? 0,
    concessionNote: formData.get("concessionNote") ?? "",
  });
  if (!parsed.success) {
    return { error: "Check student, guardian, and fee fields." };
  }

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        const version = await tx
          .select({
            id: feePlanVersions.id,
            totalAmountInr: feePlanVersions.totalAmountInr,
            version: feePlanVersions.version,
          })
          .from(feePlanVersions)
          .where(
            and(
              eq(feePlanVersions.id, parsed.data.planVersionId),
              eq(feePlanVersions.schoolId, ctx.schoolId),
            ),
          )
          .limit(1);

        if (!version[0]) {
          throw new Error("Selected fee plan version was not found.");
        }

        const studentRows = await tx
          .insert(students)
          .values({
            schoolId: ctx.schoolId,
            admissionNumber: parsed.data.admissionNumber,
            fullName: parsed.data.fullName,
            dateOfBirth: parsed.data.dateOfBirth,
            classLabel: parsed.data.classLabel || null,
            createdBy: ctx.userId,
          })
          .returning({ id: students.id });

        const studentId = studentRows[0]?.id;
        if (!studentId) throw new Error("Failed to create student.");

        await tx.insert(studentGuardians).values({
          schoolId: ctx.schoolId,
          studentId,
          fullName: parsed.data.guardianName,
          relationship: parsed.data.guardianRelationship,
          phone: parsed.data.guardianPhone || null,
          isPrimary: true,
        });

        const assignmentRows = await tx
          .insert(studentFeeAssignments)
          .values({
            schoolId: ctx.schoolId,
            studentId,
            planVersionId: version[0].id,
            concessionPercent: parsed.data.concessionPercent,
            concessionNote: parsed.data.concessionNote || null,
            assignedBy: ctx.userId,
          })
          .returning({ id: studentFeeAssignments.id });

        await tx.insert(feeAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "register_student_with_fee",
          entityType: "student_fee_assignment",
          entityId: assignmentRows[0]?.id,
          detail: {
            studentId,
            admissionNumber: parsed.data.admissionNumber,
            planVersionId: version[0].id,
            feeVersion: version[0].version,
            totalAmountInr: version[0].totalAmountInr,
            concessionPercent: parsed.data.concessionPercent,
          },
        });
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not register student.";
    if (message.includes("students_school_admission_number_unique")) {
      return { error: "Admission number already exists for this school." };
    }
    return { error: message };
  }

  revalidatePath(`/${workspace}/fees`);
  revalidatePath(`/${workspace}/fees/register`);
  revalidatePath(`/${workspace}/fees/collections`);
  return { ok: true };
}
