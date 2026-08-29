import { cn } from "@repo/ui/lib/utils";
import { PLATFORM_NAME } from "@/lib/brand";

type DropMarkProps = {
  className?: string;
  /** Decorative by default. Set false when the mark conveys information. */
  "aria-hidden"?: boolean;
};

/**
 * Drop of Education — inline SVG, retuned to the ink/teal accent system.
 * Used as a static render, reduced-motion fallback, and lazy placeholder.
 * Stroke colors bind to semantic tokens so the mark tracks the palette.
 */
export function DropMark({ className, ...rest }: DropMarkProps) {
  const ariaHidden = rest["aria-hidden"] ?? true;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      role={ariaHidden ? undefined : "img"}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : `${PLATFORM_NAME} drop of education`}
      className={cn("h-full w-full", className)}
    >
      <path
        fill="none"
        stroke="oklch(0.45 0.2 290)"
        strokeWidth="12"
        strokeLinejoin="round"
        d="M100 22 C142 62 168 98 168 130 C168 160 138 178 100 178 C62 178 32 160 32 130 C32 98 58 62 100 22 Z"
      />
      <path
        fill="none"
        stroke="oklch(0.55 0.22 295)"
        strokeWidth="8"
        strokeLinejoin="round"
        d="M100 38 C134 72 154 100 154 126 C154 150 130 164 100 164 C70 164 46 150 46 126 C46 100 66 72 100 38 Z"
      />
      <path
        fill="none"
        stroke="oklch(0.55 0.1 190)"
        strokeWidth="10"
        strokeLinejoin="round"
        d="M100 54 C126 84 140 106 140 124 C140 142 122 154 100 154 C78 154 60 142 60 124 C60 106 74 84 100 54 Z"
      />
      <path
        fill="none"
        stroke="oklch(0.82 0.1 175)"
        strokeWidth="7"
        strokeLinejoin="round"
        d="M100 72 C118 96 128 110 128 122 C128 136 116 144 100 144 C84 144 72 136 72 122 C72 110 82 96 100 72 Z"
      />
      <circle cx="100" cy="120" r="16" fill="oklch(0.55 0.1 190)" />
      <circle cx="100" cy="120" r="8" fill="oklch(0.83 0.16 80)" />
    </svg>
  );
}
