import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeeHeadsVisual,
  FeeStructureTimeline,
  FeesNav,
  listFeePlansWithLatestVersion,
  PublishFeePlanForm,
} from "@/features/fees";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeeStructuresPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "fees.view")) notFound();
  const canPublish = can(ctx, "fees.structure");
  const canCollect = can(ctx, "fees.collect");

  const plans = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    (tx) => listFeePlansWithLatestVersion(tx, ctx.schoolId),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Fee structures
        </h1>
        <p className="text-sm text-muted-foreground">
          Publishing creates a new version for the whole school. Students
          already registered keep the version they were billed on, including
          any scholarship. Discounts are set at registration, not on the plan.
        </p>
      </div>

      <FeesNav
        workspace={workspace}
        active="structures"
        canCollect={canCollect}
      />

      {plans.length === 0 ? (
        canPublish ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Start from demo</h2>
            <p className="text-sm text-muted-foreground">
              Edit the starter heads, then publish. That version becomes the
              live structure for new enrollments.
            </p>
            <PublishFeePlanForm workspace={workspace} startFromDemo />
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            No structures yet. A school admin publishes the first version from
            Control Hub access.
          </p>
        )
      ) : null}

      {plans.map((plan) => (
        <section
          key={plan.id}
          className="flex flex-col gap-6 border-t border-border pt-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-medium">
              {plan.name}
              {plan.isDemo ? (
                <span className="text-muted-foreground font-normal"> · demo</span>
              ) : null}
              {plan.classLabel ? (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {plan.classLabel}
                </span>
              ) : null}
            </h2>
            {plan.latestVersion ? (
              <p className="text-sm text-muted-foreground">
                Current v{plan.latestVersion.version}
              </p>
            ) : null}
          </div>

          {plan.latestVersion ? (
            <FeeHeadsVisual
              heads={plan.latestVersion.heads}
              totalAmountInr={plan.latestVersion.totalAmountInr}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No version published yet.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Change timeline</h3>
            <FeeStructureTimeline
              versions={plan.versions.map((row) => ({
                id: row.id,
                version: row.version,
                totalAmountInr: row.totalAmountInr,
                note: row.note,
                createdAt: row.createdAt,
                createdByName: row.createdByName,
                heads: row.heads,
              }))}
            />
          </div>

          {canPublish ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Publish next version</h3>
              <PublishFeePlanForm
                workspace={workspace}
                planId={plan.id}
                defaultName={plan.name}
                defaultClassLabel={plan.classLabel ?? ""}
                defaultPaymentMode={plan.paymentMode}
                defaultHeadsJson={
                  plan.latestVersion
                    ? JSON.stringify(plan.latestVersion.heads)
                    : undefined
                }
              />
            </div>
          ) : null}
        </section>
      ))}

      {plans.length > 0 && canPublish ? (
        <section className="flex flex-col gap-4 border-t border-border pt-8">
          <h2 className="text-lg font-medium">New plan</h2>
          <PublishFeePlanForm workspace={workspace} />
        </section>
      ) : null}

      {plans.length > 0 && !canPublish ? (
        <p className="text-sm text-muted-foreground">
          Viewing only. Publishing is granted from Control Hub.
        </p>
      ) : null}
    </div>
  );
}
