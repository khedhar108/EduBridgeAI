"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";

type AppLoaderProps = {
  label?: string;
  className?: string;
};

/**
 * Universal async loader. Dotmatrix lands when registry is wired;
 * until then Spinner + reduced-motion respect.
 */
export function AppLoader({ label = "Loading", className }: AppLoaderProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16",
        className,
      )}
    >
      {reduceMotion ? (
        <Spinner className="size-8 text-primary" />
      ) : (
        <div className="grid grid-cols-3 gap-1" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
            <span
              key={cell}
              className="size-2 rounded-sm bg-primary/80 animate-pulse"
              style={{ animationDelay: `${cell * 80}ms` }}
            />
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
