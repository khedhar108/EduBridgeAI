"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";
import {
  DecryptReveal,
  type DecryptRevealOptions,
} from "@repo/ui/components/canvasui/DecryptReveal";

/**
 * Brand hex for WebGL cipher tint — Three.js / canvas parsers reject oklch.
 * Matches primary teal direction from MASTER (soft stone canvas + teal accent).
 */
export const DECRYPT_CIPHER_COLOR = "#0d9488";
/** Near `:root --background` stone canvas as sRGB for glyph thresholding. */
export const DECRYPT_BACKGROUND = "#f9f8f5";

export type DecryptRevealPanelProps = DecryptRevealOptions & {
  children: ReactNode;
  className?: string;
};

/**
 * Marketing wrapper for Canvas UI decrypt-reveal.
 * Needs an explicit height (absolute capture canvas). Unsupported browsers
 * fall back to plain children via the vendored component.
 */
export function DecryptRevealPanel({
  children,
  className,
  radius = 360,
  softness = 0.5,
  cell = 10,
  aspect = 0.75,
  colored = 1,
  color = DECRYPT_CIPHER_COLOR,
  brightness = 1,
  legibility = 1,
  contrast = 1,
  exposure = 1,
  scramble = 0.1,
  scrambleSpeed = 6,
  edgeWidth = 0.2,
  edgeFlicker = 1,
  edgeGlow = 1.6,
  edgeTint = 0.75,
  aberration = 8,
  passthrough = 0.12,
  threshold = 0.025,
  background = DECRYPT_BACKGROUND,
  smoothing = 0.2,
  ...options
}: DecryptRevealPanelProps) {
  return (
    <DecryptReveal
      className={cn(
        "h-[min(70dvh,42rem)] w-full rounded-xl border border-border bg-background",
        className,
      )}
      radius={radius}
      softness={softness}
      cell={cell}
      aspect={aspect}
      colored={colored}
      color={color}
      brightness={brightness}
      legibility={legibility}
      contrast={contrast}
      exposure={exposure}
      scramble={scramble}
      scrambleSpeed={scrambleSpeed}
      edgeWidth={edgeWidth}
      edgeFlicker={edgeFlicker}
      edgeGlow={edgeGlow}
      edgeTint={edgeTint}
      aberration={aberration}
      passthrough={passthrough}
      threshold={threshold}
      background={background}
      smoothing={smoothing}
      {...options}
    >
      <div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
    </DecryptReveal>
  );
}
