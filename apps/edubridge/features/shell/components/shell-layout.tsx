import type { ReactNode } from "react";
import type { ModuleNavItem } from "../modules";
import { ShellHeader } from "./shell-header";

type ShellLayoutProps = {
  workspace: string;
  schoolSlug: string;
  email?: string;
  role: string;
  nav: ModuleNavItem[];
  children: ReactNode;
};

export function ShellLayout({
  workspace,
  schoolSlug,
  email,
  role,
  nav,
  children,
}: ShellLayoutProps) {
  return (
    <div className="min-h-dvh bg-background">
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
