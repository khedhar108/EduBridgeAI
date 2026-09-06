import { formatInr } from "../lib/money";

export type VisualFeeHead = {
  label: string;
  amountInr: number;
};

type Props = {
  heads: VisualFeeHead[];
  totalAmountInr: number;
};

export function FeeHeadsVisual({ heads, totalAmountInr }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Structure total
        </p>
        <p className="font-serif text-3xl font-semibold tracking-tight tabular-nums">
          {formatInr(totalAmountInr)}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {heads.map((head) => {
          const share =
            totalAmountInr > 0
              ? Math.min(100, Math.round((head.amountInr / totalAmountInr) * 100))
              : 0;
          return (
            <li key={`${head.label}-${head.amountInr}`} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{head.label}</span>
                <span className="tabular-nums text-foreground">
                  {formatInr(head.amountInr)}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
