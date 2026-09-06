import Link from "next/link";
import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Separator } from "@repo/ui/components/separator";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { formatDob } from "../lib/format-dob";
import { formatInr } from "../lib/format-inr";
import { studentInitials } from "../lib/student-initials";
import {
  getStudentAttendanceSummary,
  listStudentAttendance,
} from "../queries/attendance";
import {
  getStaffFeeSummary,
  type FamilyFeeSummary,
} from "../queries/get-family-fee";
import { getStaffStudent } from "../queries/get-staff-student";

type Props = {
  workspace: string;
  studentId: string;
};

export async function SchoolStudentDetailPage({
  workspace,
  studentId,
}: Props) {
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "students.view")) notFound();

  const showFees = can(ctx, "fees.view");

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const student = await getStaffStudent(
        tx,
        ctx.schoolId,
        studentId,
        ctx.userId,
        ctx.role,
      );
      if (!student) return null;
      const [summary, entries, fees] = await Promise.all([
        getStudentAttendanceSummary(tx, ctx.schoolId, studentId),
        listStudentAttendance(tx, ctx.schoolId, studentId),
        showFees
          ? getStaffFeeSummary(tx, ctx.schoolId, studentId)
          : Promise.resolve(null),
      ]);
      return { student, summary, entries, fees };
    },
  );

  if (!data) notFound();

  const { student, summary, entries, fees } = data;
  const percent =
    summary.total === 0
      ? null
      : Math.round(((summary.present + summary.late) / summary.total) * 100);
  const classHref = student.classId
    ? `/${workspace}/students?class=${student.classId}`
    : `/${workspace}/students`;
  const classLabel = [student.className, student.classSection]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          <Link href={`/${workspace}/students`} className="underline-offset-4 hover:underline">
            Students
          </Link>
          {classLabel ? (
            <>
              {" · "}
              <Link href={classHref} className="underline-offset-4 hover:underline">
                {classLabel}
              </Link>
            </>
          ) : null}
          {student.academicYear ? ` · ${student.academicYear}` : null}
        </p>
      </div>

      <section className="flex items-start gap-4">
        <Avatar className="size-16 text-base">
          {student.photoUrl ? (
            <AvatarImage src={student.photoUrl} alt="" />
          ) : null}
          <AvatarFallback>{studentInitials(student.fullName)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {student.fullName}
          </h1>
          <p className="text-sm tabular-nums text-muted-foreground">
            {student.admissionNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            Born {formatDob(student.dateOfBirth)}
            {classLabel ? ` · ${classLabel}` : null}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Days marked" value={String(summary.total)} />
        <Stat
          label="Present %"
          value={percent === null ? "—" : `${percent}%`}
        />
        <Stat
          label="Absent / late"
          value={`${summary.absent} / ${summary.late}`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Family</h2>
        {student.guardians.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No parent or guardian on file.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {student.guardians.map((guardian) => (
              <li
                key={`${guardian.fullName}-${guardian.relationship}`}
                className="flex flex-col gap-1 px-4 py-3"
              >
                <p className="text-sm font-medium">
                  {guardian.fullName}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {guardian.relationship}
                    {guardian.isPrimary ? " · primary" : ""}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {[guardian.phone, guardian.email].filter(Boolean).join(" · ") ||
                    "No phone or email on file."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Address</h2>
        <p className="text-sm text-muted-foreground">
          No address on file. The school has not recorded one for this child.
        </p>
      </section>

      {showFees ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Fees</h2>
          {fees ? (
            <StaffFeeBlock summary={fees} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No fee plan on this admission yet.
            </p>
          )}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Register</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attendance recorded for this child yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {entries.map((entry) => (
              <li
                key={entry.onDate}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="tabular-nums text-muted-foreground">
                  {entry.onDate}
                </span>
                <span className="capitalize">{entry.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StaffFeeBlock({ summary }: { summary: FamilyFeeSummary }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {summary.planName} · version {summary.version}
        </p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {formatInr(summary.dueInr)}
        </p>
        <p className="text-sm text-muted-foreground">
          {summary.dueInr > 0 ? "Balance due" : "Fully paid"}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Plan total</dt>
          <dd className="tabular-nums">{formatInr(summary.totalAmountInr)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Scholarship</dt>
          <dd className="tabular-nums">{summary.concessionPercent}%</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Payable</dt>
          <dd className="tabular-nums">{formatInr(summary.payableInr)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Received</dt>
          <dd className="tabular-nums">{formatInr(summary.paidInr)}</dd>
        </div>
      </dl>
      {summary.heads.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {summary.heads.map((head) => (
            <li
              key={head.label}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-muted-foreground">{head.label}</span>
              <span className="tabular-nums">{formatInr(head.amountInr)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <Separator />
      {summary.payments.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {summary.payments.map((payment, index) => (
            <li
              key={`${payment.paidAt.toISOString()}-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-muted-foreground">
                {payment.paidAt.toLocaleDateString("en-IN")} · {payment.method}
              </span>
              <span className="tabular-nums">
                {formatInr(payment.amountInr)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No office collections recorded yet.
        </p>
      )}
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
