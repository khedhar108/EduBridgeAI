import { notFound } from "next/navigation";
import { withTenant } from "@repo/db";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { can } from "@/lib/auth/capabilities";
import { formatRoleLabel, modulesForRole, WorkspaceModuleCards } from "@/features/shell";
import { listSchoolMembers, StaffDirectory } from "@/features/auth";
import { listSchoolStudents, StudentsPanel } from "@/features/fees";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceHomePage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx) notFound();

  const nav = modulesForRole(ctx.role);
  const roleLabel = formatRoleLabel(ctx.role);
  const firstName = ctx.email?.split("@")[0] ?? "there";
  const showDirectory = can(ctx, "members.viewDirectory");

  const data = showDirectory
    ? await withTenant(
        { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
        async (tx) => ({
          members: await listSchoolMembers(tx, ctx.schoolId),
          students: await listSchoolStudents(tx, ctx.schoolId),
        }),
      )
    : { members: [], students: [] };

  const activeMembers = data.members.filter((m) => m.isActive).length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary capitalize">
          {roleLabel}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {showDirectory
            ? `Manage your team and monitor access for ${workspace}.`
            : `Everything for ${workspace} lives in the modules below — pick one to get started.`}
        </p>
      </div>

      {showDirectory ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Stat label="Active members" value={String(activeMembers)} />
            <Stat label="Students" value={String(data.students.length)} />
            <Stat
              label="Classes"
              value={String(
                new Set(
                  data.students
                    .map((s) => s.classLabel)
                    .filter((c): c is string => c !== null),
                ).size,
              )}
            />
          </section>

          <StaffDirectory
            workspace={workspace}
            members={data.members}
            currentUserId={ctx.userId}
            currentRole={ctx.role}
          />

          <StudentsPanel students={data.students} />
        </>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Your modules
          </h2>
          <WorkspaceModuleCards workspace={workspace} items={nav} />
        </section>
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
