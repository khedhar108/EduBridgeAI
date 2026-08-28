"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  DEMO_ACCOUNTS,
  dispatchDemoPrefill,
  stashDemoPrefill,
} from "../lib/demo-accounts";

const isProd = process.env.NODE_ENV === "production";

export function DemoAccountsModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (isProd) return null;

  const fill = (email: string, password: string, surface: "school" | "platform") => {
    setOpen(false);
    // Owner signs in on /platform/sign-in; staff on /sign-in.
    if (surface === "platform" && window.location.pathname !== "/platform/sign-in") {
      stashDemoPrefill(email, password);
      router.push("/platform/sign-in");
      return;
    }
    if (surface === "school" && window.location.pathname === "/platform/sign-in") {
      stashDemoPrefill(email, password);
      router.push("/sign-in");
      return;
    }
    dispatchDemoPrefill(email, password);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <UserRound className="size-3.5" />
          Demo accounts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demo accounts</DialogTitle>
          <DialogDescription>
            Local test logins (password for all:{" "}
            <span className="font-mono text-foreground">TestLogin123!</span>).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => fill(account.email, account.password, account.surface)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  {account.role}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {account.email}
                </span>
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {account.surface === "platform" ? "Platform" : "School"}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Clicking a role fills the sign-in form for you.
        </p>
      </DialogContent>
    </Dialog>
  );
}
