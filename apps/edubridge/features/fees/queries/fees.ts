import {
  and,
  desc,
  eq,
  feeAuditEvents,
  feePayments,
  feePlans,
  feePlanVersions,
  isNull,
  profiles,
  studentFeeAssignments,
  studentGuardians,
  students,
  type TenantTx,
} from "@repo/db";

export type SchoolStudentRow = {
  id: string;
  admissionNumber: string;
  fullName: string;
  dateOfBirth: string;
  classLabel: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
};

/** Plain student roster with primary guardian — admin dashboard view. */
export async function listSchoolStudents(
  tx: TenantTx,
  schoolId: string,
): Promise<SchoolStudentRow[]> {
  return tx
    .select({
      id: students.id,
      admissionNumber: students.admissionNumber,
      fullName: students.fullName,
      dateOfBirth: students.dateOfBirth,
      classLabel: students.classLabel,
      guardianName: studentGuardians.fullName,
      guardianPhone: studentGuardians.phone,
      guardianEmail: studentGuardians.email,
    })
    .from(students)
    .leftJoin(
      studentGuardians,
      and(
        eq(studentGuardians.studentId, students.id),
        eq(studentGuardians.isPrimary, true),
      ),
    )
    .where(eq(students.schoolId, schoolId))
    .orderBy(students.admissionNumber);
}

export async function listFeePlansWithLatestVersion(
  tx: TenantTx,
  schoolId: string,
) {
  const plans = await tx
    .select()
    .from(feePlans)
    .where(and(eq(feePlans.schoolId, schoolId), isNull(feePlans.archivedAt)))
    .orderBy(feePlans.name);

  const versions = await tx
    .select()
    .from(feePlanVersions)
    .where(eq(feePlanVersions.schoolId, schoolId))
    .orderBy(desc(feePlanVersions.version));

  return plans.map((plan) => ({
    ...plan,
    latestVersion: versions.find((v) => v.planId === plan.id) ?? null,
  }));
}

export async function listPlanVersions(tx: TenantTx, schoolId: string) {
  return tx
    .select({
      id: feePlanVersions.id,
      planId: feePlanVersions.planId,
      planName: feePlans.name,
      version: feePlanVersions.version,
      paymentMode: feePlanVersions.paymentMode,
      totalAmountInr: feePlanVersions.totalAmountInr,
      heads: feePlanVersions.heads,
      createdAt: feePlanVersions.createdAt,
    })
    .from(feePlanVersions)
    .innerJoin(feePlans, eq(feePlanVersions.planId, feePlans.id))
    .where(eq(feePlanVersions.schoolId, schoolId))
    .orderBy(desc(feePlanVersions.createdAt));
}

export async function listStudentsWithFees(tx: TenantTx, schoolId: string) {
  return tx
    .select({
      studentId: students.id,
      admissionNumber: students.admissionNumber,
      fullName: students.fullName,
      classLabel: students.classLabel,
      assignmentId: studentFeeAssignments.id,
      planVersionId: studentFeeAssignments.planVersionId,
      concessionPercent: studentFeeAssignments.concessionPercent,
      totalAmountInr: feePlanVersions.totalAmountInr,
      planName: feePlans.name,
      version: feePlanVersions.version,
    })
    .from(students)
    .leftJoin(
      studentFeeAssignments,
      eq(studentFeeAssignments.studentId, students.id),
    )
    .leftJoin(
      feePlanVersions,
      eq(studentFeeAssignments.planVersionId, feePlanVersions.id),
    )
    .leftJoin(feePlans, eq(feePlanVersions.planId, feePlans.id))
    .where(eq(students.schoolId, schoolId))
    .orderBy(students.admissionNumber);
}

export async function listRecentPayments(tx: TenantTx, schoolId: string) {
  return tx
    .select({
      id: feePayments.id,
      amountInr: feePayments.amountInr,
      method: feePayments.method,
      paidAt: feePayments.paidAt,
      admissionNumber: students.admissionNumber,
      studentName: students.fullName,
      recordedByName: profiles.fullName,
    })
    .from(feePayments)
    .innerJoin(students, eq(feePayments.studentId, students.id))
    .leftJoin(profiles, eq(feePayments.recordedBy, profiles.id))
    .where(eq(feePayments.schoolId, schoolId))
    .orderBy(desc(feePayments.paidAt))
    .limit(50);
}

export async function listFeeAudit(tx: TenantTx, schoolId: string) {
  return tx
    .select({
      id: feeAuditEvents.id,
      action: feeAuditEvents.action,
      entityType: feeAuditEvents.entityType,
      detail: feeAuditEvents.detail,
      createdAt: feeAuditEvents.createdAt,
      actorName: profiles.fullName,
    })
    .from(feeAuditEvents)
    .leftJoin(profiles, eq(feeAuditEvents.actorId, profiles.id))
    .where(eq(feeAuditEvents.schoolId, schoolId))
    .orderBy(desc(feeAuditEvents.createdAt))
    .limit(100);
}
