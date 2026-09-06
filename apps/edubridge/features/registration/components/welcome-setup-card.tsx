"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

type Props = {
  workspace: string;
  shareHost: string;
};

export function WelcomeSetupCard({ workspace, shareHost }: Props) {
  const storageKey = `eb.setup.v1.${workspace}`;
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(storageKey) === "1");
    } catch {
      setHidden(false);
    }
    setReady(true);
  }, [storageKey]);

  if (!ready || hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Get started</h2>
          <p className="text-sm text-muted-foreground">
            Your school is live at{" "}
            <span className="font-mono text-foreground">{shareHost}</span>. Add
            a coordinator when you are ready — you can skip this.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
      <p>
        <Link
          href={`/${workspace}/settings/team`}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Open team directory
        </Link>
      </p>
    </section>
  );
}
