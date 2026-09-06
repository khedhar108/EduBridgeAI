import { cache } from "react";
import {
  and,
  desc,
  eq,
  feePayments,
  feePlans,
  feePlanVersions,
  getDb,
  studentFeeAssignments,
  type Db,
  type TenantTx,
} from "@repo/db";

export type FamilyFeePayment = {
  amountInr: number;
  paidAt: Date;
  method: string;
};

export type FamilyFeeSummary = {
  planName: string;
  version: number;
  totalAmountInr: number;
  concessionPercent: number;
  payableInr: number;
  paidInr: number;
  dueInr: number;
  heads: { label: string; amountInr: number }[];
  payments: FamilyFeePayment[];
};

async function loadFeeSummary(
  db: Db | TenantTx,
  schoolId: string,
  studentId: string,
): Promise<FamilyFeeSummary | null> {
  const assignmentRows = await db
    .select({
      assignmentId: studentFeeAssignments.id,
      concessionPercent: studentFeeAssignments.concessionPercent,
      totalAmountInr: feePlanVersions.totalAmountInr,
      version: feePlanVersions.version,
      heads: feePlanVersions.heads,
      planName: feePlans.name,
    })
    .from(studentFeeAssignments)
    .innerJoin(
      feePlanVersions,
      eq(studentFeeAssignments.planVersionId, feePlanVersions.id),
    )
    .innerJoin(feePlans, eq(feePlanVersions.planId, feePlans.id))
    .where(
      and(
        eq(studentFeeAssignments.schoolId, schoolId),
        eq(studentFeeAssignments.studentId, studentId),
      ),
    )
    .limit(1);

  const assignment = assignmentRows[0];
  if (!assignment) return null;

  const paymentRows = await db
    .select({
      amountInr: feePayments.amountInr,
      paidAt: feePayments.paidAt,
      method: feePayments.method,
    })
    .from(feePayments)
    .where(
      and(
        eq(feePayments.schoolId, schoolId),
        eq(feePayments.studentId, studentId),
      ),
    )
    .orderBy(desc(feePayments.paidAt));

  const paidInr = paymentRows.reduce((sum, row) => sum + row.amountInr, 0);
  const payableInr = Math.round(
    (assignment.totalAmountInr * (100 - assignment.concessionPercent)) / 100,
  );
  const dueInr = Math.max(0, payableInr - paidInr);

  return {
    planName: assignment.planName,
    version: assignment.version,
    totalAmountInr: assignment.totalAmountInr,
    concessionPercent: assignment.concessionPercent,
    payableInr,
    paidInr,
    dueInr,
    heads: assignment.heads.map((head) => ({
      label: head.label,
      amountInr: head.amountInr,
    })),
    payments: paymentRows,
  };
}

export async function getStaffFeeSummary(
  tx: TenantTx,
  schoolId: string,
  studentId: string,
): Promise<FamilyFeeSummary | null> {
  return loadFeeSummary(tx, schoolId, studentId);
}

export const getFamilyFeeSummary = cache(
  async (
    schoolId: string,
    studentId: string,
  ): Promise<FamilyFeeSummary | null> => {
    return loadFeeSummary(getDb(), schoolId, studentId);
  },
);
