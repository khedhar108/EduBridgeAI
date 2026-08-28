import { notFound } from "next/navigation";
import {
  getInactiveMembership,
  getSessionContext,
} from "@/lib/tenancy/session-context";
import {
  AccountDisabledScreen,
  ShellLayout,
  modulesForRole,
} from "@/features/shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
};

export default async function StaffWorkspaceLayout({ children, params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx) {
    const inactive = await getInactiveMembership(workspace);
    if (inactive) {
      return (
        <AccountDisabledScreen
          schoolName={inactive.schoolName}
          archived={inactive.archived}
        />
      );
    }
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
      isImpersonating={ctx.isImpersonating}
      realEmail={ctx.realEmail}
    >
      {children}
    </ShellLayout>
  );
}
