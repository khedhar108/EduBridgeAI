import { formatInr } from "../lib/money";
import type { VisualFeeHead } from "./fee-heads-visual";

export type FeeVersionHistoryRow = {
  id: string;
  version: number;
  totalAmountInr: number;
  note: string | null;
  createdAt: Date;
  createdByName: string | null;
  heads: VisualFeeHead[];
};

type Props = {
  versions: FeeVersionHistoryRow[];
};

export function FeeStructureTimeline({ versions }: Props) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No versions published yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-0 border-l border-border pl-4">
      {versions.map((row, index) => (
        <li key={row.id} className="relative pb-6 last:pb-0">
          <span className="bg-primary absolute top-1.5 -left-[21px] size-2.5 rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">
                Version {row.version}
                {index === 0 ? (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    · current
                  </span>
                ) : null}
              </p>
              <p className="text-sm tabular-nums font-medium">
                {formatInr(row.totalAmountInr)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {row.createdAt.toISOString().slice(0, 10)}
              {row.createdByName ? ` · ${row.createdByName}` : ""}
            </p>
            {row.note ? (
              <p className="text-sm text-foreground">{row.note}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {row.heads.map((head) => head.label).join(" · ")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
