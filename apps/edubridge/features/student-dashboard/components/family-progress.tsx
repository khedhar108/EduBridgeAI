import { FamilyAwaiting } from "./family-awaiting";
import { FamilyPageIntro } from "./family-page-intro";
import type { FamilyAttendanceSummary } from "../queries/get-family-academic";

type Props = {
  summary: FamilyAttendanceSummary | null;
};

export function FamilyProgress({ summary }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <FamilyPageIntro
        title="Progress"
        description="Attendance and a year snapshot for this child. Teachers record this in the staff workspace."
      />
      {summary ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">Attendance</h2>
          <p className="font-serif text-3xl font-semibold tracking-tight">
            {summary.percentPresent}%
          </p>
          <p className="text-sm text-muted-foreground">
            Present or late on {summary.present + summary.late} of{" "}
            {summary.total} marked days.
          </p>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border border-border px-3 py-3">
              <dt className="text-muted-foreground">Present</dt>
              <dd className="mt-1 font-medium tabular-nums">{summary.present}</dd>
            </div>
            <div className="rounded-md border border-border px-3 py-3">
              <dt className="text-muted-foreground">Late</dt>
              <dd className="mt-1 font-medium tabular-nums">{summary.late}</dd>
            </div>
            <div className="rounded-md border border-border px-3 py-3">
              <dt className="text-muted-foreground">Absent</dt>
              <dd className="mt-1 font-medium tabular-nums">{summary.absent}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <FamilyAwaiting title="Attendance">
          Daily present / absent / late will appear as a monthly percentage once
          the class teacher starts marking the register.
        </FamilyAwaiting>
      )}
      <FamilyAwaiting title="This year">
        Subject-wise progress against the class will show here after marks are
        entered. Nothing is invented while the school has not recorded it.
      </FamilyAwaiting>
    </div>
  );
}
