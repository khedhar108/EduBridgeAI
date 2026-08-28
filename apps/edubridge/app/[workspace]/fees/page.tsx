import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeesNav,
  isMoneyRole,
  listFeePlansWithLatestVersion,
  listRecentPayments,
  listStudentsWithFees,
} from "@/features/fees";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeesOverviewPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !isMoneyRole(ctx.role)) notFound();

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
          Versioned fee structures, student registration pins, and collections.
          Signed in as {ctx.role.replace(/_/g, " ")}.
        </p>
      </div>

      <FeesNav workspace={workspace} active="overview" />

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active plans" value={String(data.plans.length)} />
        <Stat label="Registered students" value={String(data.students.length)} />
        <Stat
          label="Recent payments"
          value={String(data.payments.length)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Latest plan versions</h2>
        {data.plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fee plans yet. Publish one under Structures.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.plans.map((plan) => (
              <li
                key={plan.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium">{plan.name}</span>
                <span className="text-muted-foreground">
                  {plan.latestVersion
                    ? `v${plan.latestVersion.version} · ₹${plan.latestVersion.totalAmountInr}`
                    : "No version published"}
                </span>
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
