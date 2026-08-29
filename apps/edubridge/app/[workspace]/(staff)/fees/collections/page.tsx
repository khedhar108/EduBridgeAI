import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeesNav,
  formatInr,
  listRecentPayments,
  listStudentsWithFees,
  payableInr,
  RecordPaymentForm,
} from "@/features/fees";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeeCollectionsPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "fees.view")) notFound();
  const canCollect = can(ctx, "fees.collect");

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const [students, payments] = await Promise.all([
        listStudentsWithFees(tx, ctx.schoolId),
        listRecentPayments(tx, ctx.schoolId),
      ]);
      return { students, payments };
    },
  );

  const assignments = data.students
    .filter((s) => s.assignmentId)
    .map((s) => {
      const gross = s.totalAmountInr ?? 0;
      const net = payableInr(gross, s.concessionPercent ?? 0);
      return {
        id: s.assignmentId as string,
        label: `${s.admissionNumber} · ${s.fullName} · ${formatInr(net)} after ${s.concessionPercent}% off (v${s.version})`,
      };
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground">
          Amounts follow the pinned version and scholarship from registration.
          New structure publishes do not rewrite these rows.
        </p>
      </div>

      <FeesNav
        workspace={workspace}
        active="collections"
        canCollect={canCollect}
      />

      {canCollect ? (
        <RecordPaymentForm workspace={workspace} assignments={assignments} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Viewing collections only. Recording payments needs Collect on Control
          Hub.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Recent payments</h2>
        {data.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium">{formatInr(p.amountInr)}</span>{" "}
                  <span className="text-muted-foreground">
                    {p.admissionNumber} · {p.studentName} · {p.method}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.paidAt.toISOString().slice(0, 10)}
                  {p.recordedByName ? ` · ${p.recordedByName}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
