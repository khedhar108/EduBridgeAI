import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeesNav,
  isMoneyRole,
  listRecentPayments,
  listStudentsWithFees,
  RecordPaymentForm,
} from "@/features/fees";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeeCollectionsPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !isMoneyRole(ctx.role)) notFound();

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
    .map((s) => ({
      id: s.assignmentId as string,
      label: `${s.admissionNumber} · ${s.fullName} · ₹${s.totalAmountInr ?? 0} (${s.concessionPercent}% off)`,
    }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground">
          Manual payment recording. Online gateways stay out of scope for now.
        </p>
      </div>

      <FeesNav workspace={workspace} active="collections" />

      <RecordPaymentForm workspace={workspace} assignments={assignments} />

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
                  <span className="font-medium">₹{p.amountInr}</span>{" "}
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
