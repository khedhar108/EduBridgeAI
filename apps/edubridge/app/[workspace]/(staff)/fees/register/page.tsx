import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import {
  FeesNav,
  formatInr,
  listPlanVersions,
  listStudentsWithFees,
  payableInr,
  RegisterStudentForm,
} from "@/features/fees";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeeRegisterPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "fees.view")) notFound();
  const canCollect = can(ctx, "fees.collect");

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const [versions, students] = await Promise.all([
        listPlanVersions(tx, ctx.schoolId),
        listStudentsWithFees(tx, ctx.schoolId),
      ]);
      return { versions, students };
    },
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Register student
        </h1>
        <p className="text-sm text-muted-foreground">
          Admission number is unique per school. The chosen fee version and
          scholarship are pinned and will not change if structures are updated
          later.
        </p>
      </div>

      <FeesNav
        workspace={workspace}
        active="register"
        canCollect={canCollect}
      />

      {canCollect ? (
        <RegisterStudentForm
          workspace={workspace}
          planVersions={data.versions.map((v) => ({
            id: v.id,
            label: `${v.planName} · v${v.version} · ${formatInr(v.totalAmountInr)}`,
            totalAmountInr: v.totalAmountInr,
          }))}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Viewing enrollments only. Recording new students needs Collect on
          Control Hub.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Registered students</h2>
        {data.students.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.students.map((s) => {
              const gross = s.totalAmountInr ?? 0;
              const net = payableInr(gross, s.concessionPercent ?? 0);
              return (
                <li
                  key={s.studentId}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {s.admissionNumber}
                    </span>{" "}
                    <span className="font-medium">{s.fullName}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {s.planName
                      ? `${s.planName} v${s.version} · ${formatInr(net)} after ${s.concessionPercent}% off`
                      : "No fee pinned"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
