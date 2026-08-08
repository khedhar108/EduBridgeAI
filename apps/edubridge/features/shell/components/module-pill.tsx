"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ModuleNavItem } from "../modules";
import { findActiveModule, moduleHref } from "../nav-utils";

type ModulePillProps = {
  workspace: string;
  items: ModuleNavItem[];
};

export function ModulePill({ workspace, items }: ModulePillProps) {
  const pathname = usePathname();
  const active = findActiveModule(pathname, workspace, items);

  if (!active) return null;

  return (
    <Link
      href={moduleHref(workspace, active)}
      className="hidden items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent md:inline-flex"
    >
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full bg-primary"
      />
      {active.title}
    </Link>
  );
}
