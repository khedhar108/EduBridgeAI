"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { WorkspaceUrlDisplay } from "@/lib/tenancy/workspace-host";

type Props = {
  url: WorkspaceUrlDisplay;
};

export function WorkspacePublicUrl({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url.shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          School URL
        </p>
        <p className="mt-1 truncate font-mono text-sm font-medium sm:text-base">
          {url.shareHost}
        </p>
        {url.onSchoolHost ? (
          <p className="mt-1 text-xs text-muted-foreground">
            You are on this address now. Share it with staff and families.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Live address once DNS is on. On this computer:{" "}
            <span className="font-mono">{url.localHint}</span>
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-11 shrink-0"
        onClick={() => void copy()}
      >
        {copied ? (
          <CheckIcon className="size-4" />
        ) : (
          <CopyIcon className="size-4" />
        )}
        {copied ? "Copied" : "Copy URL"}
      </Button>
    </section>
  );
}
