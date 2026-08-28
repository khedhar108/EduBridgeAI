"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";
import {
  ParticleScroll,
  type ParticleScrollOptions,
} from "@repo/ui/components/canvasui/ParticleScroll";

export type ParticleScrollPageProps = ParticleScrollOptions & {
  children: ReactNode;
  className?: string;
};

/**
 * EduBridge calm sand preset for the marketing homepage shell.
 *
 * Formation line sits lower so hero + particle-object stay assembled.
 * Lower drift/swirl, longer settle — institutional premium, not party sand.
 *
 * Scroll happens *inside* this viewport (not on `document`). Shell is
 * `100dvh` + `overflow-hidden`; tall children are required for dissolve.
 * Unsupported browsers / reduced-motion get plain overflow scroll.
 */
export function ParticleScrollPage({
  children,
  className,
  point = 0.75,
  band = 520,
  density = 1.85,
  size = 1.2,
  spread = 180,
  gravity = 0.4,
  drift = 0.4,
  swirl = 32,
  stagger = 0.65,
  fade = 0.8,
  settle = 1.5,
  smoothing = 0.6,
}: ParticleScrollPageProps) {
  return (
    <ParticleScroll
      className={cn("h-dvh w-full overflow-hidden bg-background", className)}
      style={{ height: "100dvh", background: "var(--background)" }}
      point={point}
      band={band}
      density={density}
      size={size}
      spread={spread}
      gravity={gravity}
      drift={drift}
      swirl={swirl}
      stagger={stagger}
      fade={fade}
      settle={settle}
      smoothing={smoothing}
    >
      {children}
    </ParticleScroll>
  );
}
