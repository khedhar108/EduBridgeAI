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
  const firstName = ctx.email?.split("@")[0] ?? "there";

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
          Everything for {workspace} lives in the modules below — pick one to
          get started.
        </p>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Your modules
        </h2>
        <WorkspaceModuleCards workspace={workspace} items={nav} />
      </section>
    </div>
  );
}
