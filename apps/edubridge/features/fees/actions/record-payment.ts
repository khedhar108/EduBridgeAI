"use server";

import { revalidatePath } from "next/cache";
import {
  and,
  eq,
  feeAuditEvents,
  feePayments,
  studentFeeAssignments,
  withTenant,
} from "@repo/db";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { can } from "@/lib/auth/capabilities";
import { recordPaymentSchema } from "../lib/schemas";

export type RecordPaymentState = { error?: string; ok?: boolean };

export async function recordPaymentAction(
  workspace: string,
  _prev: RecordPaymentState,
  formData: FormData,
): Promise<RecordPaymentState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  if (!can(ctx, "fees.collect")) {
    return { error: "You cannot record fee payments." };
  }

  const parsed = recordPaymentSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    amountInr: formData.get("amountInr"),
    method: formData.get("method"),
    reference: formData.get("reference") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { error: "Check amount, method, and assignment." };
  }

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        const assignment = await tx
          .select({
            id: studentFeeAssignments.id,
            studentId: studentFeeAssignments.studentId,
          })
          .from(studentFeeAssignments)
          .where(
            and(
              eq(studentFeeAssignments.id, parsed.data.assignmentId),
              eq(studentFeeAssignments.schoolId, ctx.schoolId),
            ),
          )
          .limit(1);

        if (!assignment[0]) {
          throw new Error("Fee assignment not found.");
        }

        const paymentRows = await tx
          .insert(feePayments)
          .values({
            schoolId: ctx.schoolId,
            assignmentId: assignment[0].id,
            studentId: assignment[0].studentId,
            amountInr: parsed.data.amountInr,
            method: parsed.data.method,
            reference: parsed.data.reference || null,
            note: parsed.data.note || null,
            recordedBy: ctx.userId,
          })
          .returning({ id: feePayments.id });

        await tx.insert(feeAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "record_fee_payment",
          entityType: "fee_payment",
          entityId: paymentRows[0]?.id,
          detail: {
            assignmentId: assignment[0].id,
            studentId: assignment[0].studentId,
            amountInr: parsed.data.amountInr,
            method: parsed.data.method,
          },
        });
      },
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not record payment.",
    };
  }

  revalidatePath(`/${workspace}/fees`);
  revalidatePath(`/${workspace}/fees/collections`);
  revalidatePath(`/${workspace}/fees/audit`);
  return { ok: true };
}
