import Link from "next/link";
import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import {
  getStudentAttendanceSummary,
  listStudentAttendance,
} from "../queries/attendance";
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
      const [summary, entries] = await Promise.all([
        getStudentAttendanceSummary(tx, ctx.schoolId, studentId),
        listStudentAttendance(tx, ctx.schoolId, studentId),
      ]);
      return { student, summary, entries };
    },
  );

  if (!data) notFound();

  const { student, summary, entries } = data;
  const percent =
    summary.total === 0
      ? null
      : Math.round(((summary.present + summary.late) / summary.total) * 100);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/${workspace}/students?class=${student.classId}`}
            className="underline-offset-4 hover:underline"
          >
            {student.className} {student.classSection}
          </Link>
          {" · "}
          {student.academicYear}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {student.fullName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {student.admissionNumber}
        </p>
      </div>

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
                <span className="text-muted-foreground">{entry.onDate}</span>
                <span className="capitalize">{entry.status}</span>
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
