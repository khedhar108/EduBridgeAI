import { getSessionContext } from "@/lib/tenancy/session-context";
import { modulesForRole } from "@/features/shell";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceHomePage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx) notFound();

  const nav = modulesForRole(ctx.role);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace home</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {ctx.email ?? ctx.userId}. Modules for your role appear
          below — product features ship in later phases.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {nav.map((item) => (
          <li
            key={item.id}
            className="border-b border-border py-3 text-sm font-medium"
          >
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
