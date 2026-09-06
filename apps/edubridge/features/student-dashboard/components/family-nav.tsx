"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  CalendarDaysIcon,
  HomeIcon,
  TrendingUpIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import type { FamilyNavItem } from "../types";

const ICONS: Record<string, LucideIcon> = {
  home: HomeIcon,
  wallet: WalletIcon,
  chart: TrendingUpIcon,
  book: BookOpenIcon,
  calendar: CalendarDaysIcon,
};

type Props = {
  workspace: string;
  items: FamilyNavItem[];
};

function familyHref(workspace: string, href: string): string {
  return `/${workspace}${href}`;
}

export function FamilyNav({ workspace, items }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Family"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const href = familyHref(workspace, item.href);
          const active =
            pathname === href ||
            (item.href !== "/family/home" && pathname.startsWith(`${href}/`));
          const Icon = ICONS[item.icon] ?? HomeIcon;

          return (
            <li key={item.id}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
