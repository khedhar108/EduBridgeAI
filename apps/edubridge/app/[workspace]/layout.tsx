import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { ShellLayout, modulesForRole } from "@/features/shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx) {
    notFound();
  }

  const nav = modulesForRole(ctx.role);

  return (
    <ShellLayout
      workspace={workspace}
      schoolSlug={ctx.schoolSlug}
      email={ctx.email}
      role={ctx.role}
      nav={nav}
    >
      {children}
    </ShellLayout>
  );
}
