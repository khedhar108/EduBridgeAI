import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeesNav,
  isMoneyRole,
  listFeePlansWithLatestVersion,
  PublishFeePlanForm,
} from "@/features/fees";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeeStructuresPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !isMoneyRole(ctx.role)) notFound();

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
          Editing amounts always publishes a new version. Existing student
          assignments stay on their original version.
        </p>
      </div>

      <FeesNav workspace={workspace} active="structures" />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Publish new plan or version</h2>
        <PublishFeePlanForm workspace={workspace} />
      </section>

      {plans.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Publish next version of existing plan</h2>
          <ul className="flex flex-col gap-8">
            {plans.map((plan) => (
              <li key={plan.id} className="border-t border-border pt-6">
                <p className="mb-4 text-sm font-medium">
                  {plan.name}
                  {plan.latestVersion
                    ? ` · current v${plan.latestVersion.version}`
                    : ""}
                </p>
                <PublishFeePlanForm
                  workspace={workspace}
                  planId={plan.id}
                  defaultName={plan.name}
                  defaultClassLabel={plan.classLabel ?? ""}
                  defaultPaymentMode={plan.paymentMode}
                  defaultHeadsJson={
                    plan.latestVersion
                      ? JSON.stringify(plan.latestVersion.heads, null, 2)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
