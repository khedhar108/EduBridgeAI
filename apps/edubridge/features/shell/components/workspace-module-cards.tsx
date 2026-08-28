import Link from "next/link";
import {
  ArrowUpRightIcon,
  GraduationCapIcon,
  HomeIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
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
  wallet: WalletIcon,
  "graduation-cap": GraduationCapIcon,
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
            <Link
              href={moduleHref(workspace, item)}
              className="group block h-full"
            >
              <Card className="h-full transition-colors group-hover:border-primary/30 group-hover:bg-accent/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardTitle className="mt-4 text-base">{item.title}</CardTitle>
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
