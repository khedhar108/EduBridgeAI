import Link from "next/link";
import { GraduationCapIcon } from "lucide-react";
import { Separator } from "@repo/ui/components/separator";
import type { ModuleNavItem } from "../modules";
import { AppMenu } from "./app-menu";
import { ModulePill } from "./module-pill";
import { ProfileMenu } from "./profile-menu";
import { SearchBar, SearchBarMobile } from "./search-bar";
import { PLATFORM_NAME } from "@/lib/brand";

type ShellHeaderProps = {
  workspace: string;
  schoolSlug: string;
  email?: string;
  role: string;
  nav: ModuleNavItem[];
};

export function ShellHeader({
  workspace,
  schoolSlug,
  email,
  role,
  nav,
}: ShellHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href={`/${workspace}`}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCapIcon className="size-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base font-semibold tracking-tight text-foreground">
              {PLATFORM_NAME}
            </span>
            <span className="mt-1 hidden max-w-[12rem] truncate text-xs text-muted-foreground sm:block">
              {schoolSlug}
            </span>
          </span>
        </Link>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <AppMenu workspace={workspace} items={nav} />
        <ModulePill workspace={workspace} items={nav} />
        <SearchBar />
        <div className="ml-auto flex items-center gap-1">
          <SearchBarMobile />
          <ProfileMenu email={email} role={role} schoolSlug={schoolSlug} />
        </div>
      </div>
    </header>
  );
}
