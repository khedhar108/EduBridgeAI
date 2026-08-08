"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
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
import { signOutAction } from "@/features/auth/actions/sign-in";
import { formatRoleLabel } from "../nav-utils";

type ProfileMenuProps = {
  email?: string;
  role: string;
  schoolSlug: string;
};

function initialsFromEmail(email?: string): string {
  if (!email) return "?";
  const part = email.split("@")[0]?.trim();
  if (!part) return "?";
  return part.slice(0, 2).toUpperCase();
}

export function ProfileMenu({ email, role, schoolSlug }: ProfileMenuProps) {
  const roleLabel = formatRoleLabel(role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 px-2"
          aria-label="Open profile menu"
        >
          <Avatar size="sm">
            <AvatarFallback>{initialsFromEmail(email)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[10rem] truncate text-sm font-medium lg:inline">
            {email ?? "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm font-medium">{email ?? "Signed in"}</p>
            <p className="truncate text-xs text-muted-foreground">{schoolSlug}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled className="justify-between">
            Role
            <Badge variant="secondary" className="capitalize">
              {roleLabel}
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <form action={signOutAction} className="w-full">
              <button type="submit" className="w-full cursor-pointer text-left">
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
