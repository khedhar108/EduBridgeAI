"use client";

import Link from "next/link";
import {
  HomeIcon,
  LayoutGridIcon,
  UsersIcon,
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
import { moduleHref } from "../nav-utils";

const MODULE_ICONS: Record<string, LucideIcon> = {
  home: HomeIcon,
  users: UsersIcon,
};

type AppMenuProps = {
  workspace: string;
  items: ModuleNavItem[];
};

export function AppMenu({ workspace, items }: AppMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 gap-2 px-3">
          <LayoutGridIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Applications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Modules</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => {
            const Icon = MODULE_ICONS[item.icon] ?? HomeIcon;
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link href={moduleHref(workspace, item)} className="cursor-pointer">
                  <Icon data-icon="inline-start" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
