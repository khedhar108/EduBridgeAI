import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import type { ModuleMediaSlotContent } from "../types";

type ModuleMediaSlotProps = ModuleMediaSlotContent & {
  className?: string;
  /** Larger hero treatment */
  priority?: boolean;
};

/**
 * Image-ready media region for module showcases.
 * Without `src`, renders a calm dashed placeholder so layout stays stable
 * when marketing assets land later under `public/marketing/modules/`.
 */
export function ModuleMediaSlot({
  label,
  aspect = "16 / 9",
  src,
  alt,
  className,
  priority = false,
}: ModuleMediaSlotProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-muted/50",
        !src && "border-dashed",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? label}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_center,oklch(0.94_0.02_195),transparent_70%)] px-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-background/80 text-muted-foreground shadow-[0_1px_0_oklch(0_0_0/0.04)]">
            <ImageIcon className="size-5" aria-hidden strokeWidth={1.5} />
          </span>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
            Image slot. Drop a file under public/marketing/modules and set src.
          </p>
        </div>
      )}
    </div>
  );
}
