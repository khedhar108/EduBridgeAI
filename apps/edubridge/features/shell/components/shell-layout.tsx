import type { ReactNode } from "react";
import type { ModuleNavItem } from "../modules";
import { ShellHeader } from "./shell-header";
import { ImpersonationBanner } from "./impersonation-banner";

type ShellLayoutProps = {
  workspace: string;
  schoolSlug: string;
  email?: string;
  role: string;
  nav: ModuleNavItem[];
  children: ReactNode;
  isImpersonating?: boolean;
  realEmail?: string;
};

export function ShellLayout({
  workspace,
  schoolSlug,
  email,
  role,
  nav,
  children,
  isImpersonating,
  realEmail,
}: ShellLayoutProps) {
  return (
    <div className="min-h-dvh bg-background">
      {isImpersonating && (
        <ImpersonationBanner
          workspace={workspace}
          targetEmail={email}
          targetRole={role}
          realEmail={realEmail}
        />
      )}
      <ShellHeader
        workspace={workspace}
        schoolSlug={schoolSlug}
        email={email}
        role={role}
        nav={nav}
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
