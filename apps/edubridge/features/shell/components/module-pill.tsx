"use client";

import { usePathname } from "next/navigation";
import { HomeIcon, GraduationCapIcon, SlidersHorizontalIcon, UsersIcon, WalletIcon, type LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import type { ModuleNavItem } from "../modules";
import { findActiveModule } from "../nav-utils";

const MODULE_ICONS: Record<string, LucideIcon> = {
  home: HomeIcon,
  users: UsersIcon,
  wallet: WalletIcon,
  "graduation-cap": GraduationCapIcon,
  "sliders-horizontal": SlidersHorizontalIcon,
};

type ModulePillProps = {
  workspace: string;
  items: ModuleNavItem[];
};

/**
 * Non-interactive "you are here" indicator. Navigation to the module home
 * happens via the AppMenu — the pill only announces the active module.
 */
export function ModulePill({ workspace, items }: ModulePillProps) {
  const pathname = usePathname();
  const active = findActiveModule(pathname, workspace, items);

  if (!active) return null;

  const Icon = MODULE_ICONS[active.icon] ?? HomeIcon;

  return (
    <Badge
      variant="secondary"
      aria-current="page"
      className="hidden gap-1.5 px-3 py-1 text-sm font-medium md:inline-flex"
    >
      <Icon />
      {active.title}
    </Badge>
  );
}
