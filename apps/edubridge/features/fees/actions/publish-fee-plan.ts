"use server";

import { revalidatePath } from "next/cache";
import {
  and,
  desc,
  eq,
  feeAuditEvents,
  feePlans,
  feePlanVersions,
  type FeeHead,
  withTenant,
} from "@repo/db";
import {
  assertRole,
  getSessionContext,
} from "@/lib/tenancy/session-context";
import { MONEY_ROLES } from "../lib/roles";
import { feeHeadSchema, publishFeePlanSchema } from "../lib/schemas";

export type PublishFeePlanState = { error?: string; ok?: boolean };

function parseHeads(raw: string): FeeHead[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const heads: FeeHead[] = [];
    for (const item of parsed) {
      const result = feeHeadSchema.safeParse(item);
      if (!result.success) return null;
      heads.push(result.data);
    }
    return heads;
  } catch {
    return null;
  }
}

export async function publishFeePlanAction(
  workspace: string,
  _prev: PublishFeePlanState,
  formData: FormData,
): Promise<PublishFeePlanState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  assertRole(ctx, MONEY_ROLES);

  const parsed = publishFeePlanSchema.safeParse({
    planId: formData.get("planId") || undefined,
    name: formData.get("name"),
    classLabel: formData.get("classLabel") ?? "",
    paymentMode: formData.get("paymentMode"),
    headsJson: formData.get("headsJson"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { error: "Check plan name, payment mode, and fee heads JSON." };
  }

  const heads = parseHeads(parsed.data.headsJson);
  if (!heads) {
    return {
      error:
        'Fee heads must be a JSON array like [{"code":"registration","label":"Registration","amountInr":5000}].',
    };
  }

  const totalAmountInr = heads.reduce((sum, h) => sum + h.amountInr, 0);

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        let planId = parsed.data.planId;

        if (planId) {
          const existing = await tx
            .select({ id: feePlans.id })
            .from(feePlans)
            .where(
              and(
                eq(feePlans.id, planId),
                eq(feePlans.schoolId, ctx.schoolId),
              ),
            )
            .limit(1);
          if (existing.length === 0) {
            throw new Error("Fee plan not found.");
          }
          await tx
            .update(feePlans)
            .set({
              name: parsed.data.name,
              classLabel: parsed.data.classLabel || null,
              paymentMode: parsed.data.paymentMode,
              updatedAt: new Date(),
            })
            .where(eq(feePlans.id, planId));
        } else {
          const inserted = await tx
            .insert(feePlans)
            .values({
              schoolId: ctx.schoolId,
              name: parsed.data.name,
              classLabel: parsed.data.classLabel || null,
              paymentMode: parsed.data.paymentMode,
              createdBy: ctx.userId,
            })
            .returning({ id: feePlans.id });
          planId = inserted[0]?.id;
          if (!planId) throw new Error("Failed to create fee plan.");
        }

        const latest = await tx
          .select({ version: feePlanVersions.version })
          .from(feePlanVersions)
          .where(eq(feePlanVersions.planId, planId))
          .orderBy(desc(feePlanVersions.version))
          .limit(1);

        const nextVersion = (latest[0]?.version ?? 0) + 1;

        const versionRows = await tx
          .insert(feePlanVersions)
          .values({
            schoolId: ctx.schoolId,
            planId,
            version: nextVersion,
            paymentMode: parsed.data.paymentMode,
            heads,
            totalAmountInr,
            note: parsed.data.note || null,
            createdBy: ctx.userId,
          })
          .returning({ id: feePlanVersions.id });

        await tx.insert(feeAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "publish_fee_plan_version",
          entityType: "fee_plan_version",
          entityId: versionRows[0]?.id,
          detail: {
            planId,
            version: nextVersion,
            totalAmountInr,
            paymentMode: parsed.data.paymentMode,
            heads,
          },
        });
      },
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not publish plan.",
    };
  }

  revalidatePath(`/${workspace}/fees`);
  revalidatePath(`/${workspace}/fees/structures`);
  return { ok: true };
}
