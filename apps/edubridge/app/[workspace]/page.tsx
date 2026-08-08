import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { formatRoleLabel, modulesForRole, WorkspaceModuleCards } from "@/features/shell";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceHomePage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx) notFound();

  const nav = modulesForRole(ctx.role);
  const roleLabel = formatRoleLabel(ctx.role);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace home</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {ctx.email ?? ctx.userId} ·{" "}
          <span className="capitalize">{roleLabel}</span>
        </p>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Your modules</h2>
        <WorkspaceModuleCards workspace={workspace} items={nav} />
      </section>
    </div>
  );
}
