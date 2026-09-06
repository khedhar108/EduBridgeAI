import { Separator } from "@repo/ui/components/separator";
import { FamilyAwaiting } from "./family-awaiting";
import { FamilyPageIntro } from "./family-page-intro";
import { formatInr } from "../lib/format-inr";
import type { FamilyFeeSummary } from "../queries/get-family-fee";

type Props = {
  summary: FamilyFeeSummary | null;
};

export function FamilyFees({ summary }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <FamilyPageIntro
        title="Fees"
        description="What the school has billed for this child. Pay at the office — this screen is read-only."
      />
      {summary ? <FeeLedger summary={summary} /> : (
        <FamilyAwaiting title="No fee plan yet">
          The school has not pinned a fee structure to this admission number.
          When they register the child on a plan, the amount due will show here.
        </FamilyAwaiting>
      )}
    </div>
  );
}

function FeeLedger({ summary }: { summary: FamilyFeeSummary }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {summary.planName} · version {summary.version}
        </p>
        <p className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          {formatInr(summary.dueInr)}
        </p>
        <p className="text-sm text-muted-foreground">
          {summary.dueInr > 0 ? "Balance due" : "Fully paid"}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-0.5 rounded-md border border-border px-3 py-3">
          <dt className="text-muted-foreground">Plan total</dt>
          <dd className="font-medium tabular-nums">
            {formatInr(summary.totalAmountInr)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 rounded-md border border-border px-3 py-3">
          <dt className="text-muted-foreground">Scholarship</dt>
          <dd className="font-medium tabular-nums">
            {summary.concessionPercent}%
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 rounded-md border border-border px-3 py-3">
          <dt className="text-muted-foreground">Payable</dt>
          <dd className="font-medium tabular-nums">
            {formatInr(summary.payableInr)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 rounded-md border border-border px-3 py-3">
          <dt className="text-muted-foreground">Received</dt>
          <dd className="font-medium tabular-nums">
            {formatInr(summary.paidInr)}
          </dd>
        </div>
      </dl>
      {summary.heads.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">Fee heads</h2>
          <ul className="flex flex-col gap-2">
            {summary.heads.map((head) => (
              <li
                key={head.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{head.label}</span>
                <span className="tabular-nums text-foreground">
                  {formatInr(head.amountInr)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Separator />
      {summary.payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">Payments</h2>
          <ul className="flex flex-col gap-2">
            {summary.payments.map((payment, index) => (
              <li
                key={`${payment.paidAt.toISOString()}-${index}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {payment.paidAt.toLocaleDateString("en-IN")} · {payment.method}
                </span>
                <span className="tabular-nums text-foreground">
                  {formatInr(payment.amountInr)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No office collections recorded yet.
        </p>
      )}
    </div>
  );
}
