"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ParticleObjectBrandLazy } from "./particle-object-brand-lazy";
import {
  BRAND_MARK_VARIANTS,
  DEFAULT_BRAND_MARK_ID,
} from "./brand-marks";

/**
 * Temporary preview wrapper for choosing a brand mark.
 * Renders prev/next controls + ParticleObjectBrandLazy with the selected src.
 * To remove: delete this file and swap <BrandMarkPreview /> for
 * <ParticleObjectBrandLazy src={DEFAULT_BRAND_MARK} /> in marketing-home.tsx.
 */
export function BrandMarkPreview() {
  const [index, setIndex] = useState(
    Math.max(
      0,
      BRAND_MARK_VARIANTS.findIndex((v) => v.id === DEFAULT_BRAND_MARK_ID),
    ),
  );
  const current = BRAND_MARK_VARIANTS[index] ?? BRAND_MARK_VARIANTS[0];
  if (!current) return null;

  const go = (delta: number) => {
    setIndex(
      (i) => (i + delta + BRAND_MARK_VARIANTS.length) % BRAND_MARK_VARIANTS.length,
    );
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-0 top-0 z-20 flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-2 py-1 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => go(-1)}
          aria-label="Previous brand mark"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-[7rem] text-center text-xs text-muted-foreground">
          {index + 1} / {BRAND_MARK_VARIANTS.length} · {current.label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => go(1)}
          aria-label="Next brand mark"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <ParticleObjectBrandLazy
        className="relative h-full w-full"
        src={current.src}
      />
    </div>
  );
}
