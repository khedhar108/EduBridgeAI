"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckIcon,
  ChevronDownIcon,
  GraduationCapIcon,
  HomeIcon,
  LayoutGridIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { ModuleNavItem } from "../modules";
import { findActiveModule, moduleHref } from "../nav-utils";

const MODULE_ICONS: Record<string, LucideIcon> = {
  home: HomeIcon,
  users: UsersIcon,
  wallet: WalletIcon,
  "graduation-cap": GraduationCapIcon,
  "sliders-horizontal": SlidersHorizontalIcon,
};

type AppMenuProps = {
  workspace: string;
  items: ModuleNavItem[];
};

export function AppMenu({ workspace, items }: AppMenuProps) {
  const pathname = usePathname();
  const active = findActiveModule(pathname, workspace, items);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 px-3 text-sm font-medium"
          aria-label="Open application menu"
        >
          <LayoutGridIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Applications</span>
          <ChevronDownIcon data-icon="inline-end" className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Modules
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => {
            const Icon = MODULE_ICONS[item.icon] ?? HomeIcon;
            const isActive = active?.id === item.id;
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  href={moduleHref(workspace, item)}
                  aria-current={isActive ? "page" : undefined}
                  className="cursor-pointer justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Icon data-icon="inline-start" />
                    {item.title}
                  </span>
                  {isActive ? (
                    <CheckIcon
                      data-icon="inline-end"
                      className="text-primary"
                    />
                  ) : null}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
