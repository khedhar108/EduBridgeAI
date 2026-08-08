import Link from "next/link";
import { Separator } from "@repo/ui/components/separator";
import type { ModuleNavItem } from "../modules";
import { AppMenu } from "./app-menu";
import { ModulePill } from "./module-pill";
import { ProfileMenu } from "./profile-menu";
import { SearchBar, SearchBarMobile } from "./search-bar";

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <Link
          href={`/${workspace}`}
          className="shrink-0 font-serif text-lg tracking-tight text-foreground"
        >
          EduBridge
        </Link>
        <span className="hidden truncate text-sm text-muted-foreground sm:inline max-w-[8rem] lg:max-w-[12rem]">
          {schoolSlug}
        </span>
        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
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
