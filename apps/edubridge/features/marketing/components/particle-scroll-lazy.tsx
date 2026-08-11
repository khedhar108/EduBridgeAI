"use client";

import dynamic from "next/dynamic";

/** Client boundary so `ssr: false` is legal from Server Component pages. */
export const ParticleScrollLazy = dynamic(
  () =>
    import("./particle-scroll-page").then((m) => m.ParticleScrollPage),
  {
    ssr: false,
    loading: () => (
      <div className="h-dvh w-full bg-background" aria-hidden />
    ),
  },
);
