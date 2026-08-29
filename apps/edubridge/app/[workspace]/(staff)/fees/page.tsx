import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeeHeadsVisual,
  FeesNav,
  listFeePlansWithLatestVersion,
  listRecentPayments,
  listStudentsWithFees,
} from "@/features/fees";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeesOverviewPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "fees.view")) notFound();
  const canCollect = can(ctx, "fees.collect");

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const [plans, students, payments] = await Promise.all([
        listFeePlansWithLatestVersion(tx, ctx.schoolId),
        listStudentsWithFees(tx, ctx.schoolId),
        listRecentPayments(tx, ctx.schoolId),
      ]);
      return { plans, students, payments };
    },
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Fees</h1>
        <p className="text-sm text-muted-foreground">
          Versioned structures, pinned enrollments, and collections. Signed in
          as {ctx.role.replace(/_/g, " ")}.
        </p>
      </div>

      <FeesNav
        workspace={workspace}
        active="overview"
        canCollect={canCollect}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active plans" value={String(data.plans.length)} />
        <Stat label="Registered students" value={String(data.students.length)} />
        <Stat
          label="Recent payments"
          value={String(data.payments.length)}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Latest structures</h2>
        {data.plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fee plans yet. Publish one under Structures.
          </p>
        ) : (
          <ul className="grid gap-6 lg:grid-cols-2">
            {data.plans.map((plan) => (
              <li
                key={plan.id}
                className="flex flex-col gap-4 rounded-md border border-border px-4 py-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.latestVersion
                      ? `v${plan.latestVersion.version}`
                      : "No version"}
                  </span>
                </div>
                {plan.latestVersion ? (
                  <FeeHeadsVisual
                    heads={plan.latestVersion.heads}
                    totalAmountInr={plan.latestVersion.totalAmountInr}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
