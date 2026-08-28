"use client";

import dynamic from "next/dynamic";

/** Client boundary so `ssr: false` is legal from Server Component pages. */
export const ParticleObjectBrandLazy = dynamic(
  () =>
    import("./particle-object-brand").then((m) => m.ParticleObjectBrand),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full rounded-full bg-primary/10"
        aria-hidden
      />
    ),
  },
);
