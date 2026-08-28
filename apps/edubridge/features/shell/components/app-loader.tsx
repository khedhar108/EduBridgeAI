"use client";

import type { ComponentType } from "react";
import { DotmCircular5 } from "@repo/ui/components/dotm-circular-5";
import { DotmSquare3 } from "@repo/ui/components/dotm-square-3";
import { DotmTriangle2 } from "@repo/ui/components/dotm-triangle-2";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { usePrefersReducedMotion } from "@repo/ui/lib/dotmatrix-hooks";

/** Change this string (or pass `variant`) to swap the Dotmatrix animation. */
export type AppLoaderVariant = "square-3" | "circular-5" | "triangle-2";

const LOADERS: Record<
  AppLoaderVariant,
  ComponentType<{
    size?: number;
    dotSize?: number;
    color?: string;
    ariaLabel?: string;
    className?: string;
  }>
> = {
  "square-3": DotmSquare3,
  "circular-5": DotmCircular5,
  "triangle-2": DotmTriangle2,
};

const SIZE_PX = { sm: 28, md: 40, lg: 52 } as const;

type AppLoaderProps = {
  /** Dotmatrix variant name — swap to change the animation design. */
  variant?: AppLoaderVariant;
  label?: string;
  size?: keyof typeof SIZE_PX;
  className?: string;
};

/**
 * Universal async loader. Feature modules import this — never Dotmatrix directly.
 */
export function AppLoader({
  variant = "square-3",
  label = "Loading",
  size = "md",
  className,
}: AppLoaderProps) {
  const reduceMotion = usePrefersReducedMotion();
  const Loader = LOADERS[variant] ?? DotmSquare3;
  const px = SIZE_PX[size];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-primary",
        className,
      )}
    >
      {reduceMotion ? (
        <Spinner className="size-8 text-primary" />
      ) : (
        <Loader
          size={px}
          color="currentColor"
          ariaLabel={label}
          className="text-primary"
        />
      )}
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
