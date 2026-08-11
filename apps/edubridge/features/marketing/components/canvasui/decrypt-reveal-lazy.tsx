"use client";

import dynamic from "next/dynamic";

/** Client boundary so `ssr: false` is legal from Server Component pages. */
export const DecryptRevealLazy = dynamic(
  () =>
    import("./decrypt-reveal-panel").then((m) => m.DecryptRevealPanel),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[min(78dvh,48rem)] w-full rounded-xl border border-border bg-background"
        aria-hidden
      />
    ),
  },
);
