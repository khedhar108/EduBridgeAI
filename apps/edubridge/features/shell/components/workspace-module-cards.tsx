import Link from "next/link";
import { HomeIcon, UsersIcon, type LucideIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { ModuleNavItem } from "../modules";
import { moduleHref } from "../nav-utils";

const MODULE_ICONS: Record<string, LucideIcon> = {
  home: HomeIcon,
  users: UsersIcon,
};

type WorkspaceModuleCardsProps = {
  workspace: string;
  items: ModuleNavItem[];
};

export function WorkspaceModuleCards({
  workspace,
  items,
}: WorkspaceModuleCardsProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No modules are available for your role yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = MODULE_ICONS[item.icon] ?? HomeIcon;
        return (
          <li key={item.id}>
            <Link href={moduleHref(workspace, item)} className="block h-full">
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-5 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>
                    Open {item.title.toLowerCase()} for this school workspace.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
