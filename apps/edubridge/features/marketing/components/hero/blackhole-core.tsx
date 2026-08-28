import { cn } from "@repo/ui/lib/utils";

/**
 * Decorative gravitational well behind the orbit stage.
 * Scoped to its positioning parent — all layers anchor at the parent's
 * center (50% / 50%). Light canvas with a localized dark disc + teal
 * accretion ring. Pure CSS, no motion, no interactivity (aria-hidden).
 */
export function BlackholeCore({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {/* warm radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,oklch(0.93_0.04_195),transparent_72%)]" />

      {/* masked grid (the existing hairline field) */}
      <div className="absolute inset-0 opacity-[0.4] [background-image:linear-gradient(to_right,oklch(0.85_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.85_0_0)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_50%,black_30%,transparent_82%)]" />

      {/* warped grid: lensing — perspective-tilted, fades into the well */}
      <div className="absolute left-1/2 top-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 opacity-[0.5] [background-image:linear-gradient(to_right,oklch(0.5_0.04_200)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.04_200)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle,transparent_20%,black_44%,transparent_78%)] [transform:perspective(900px)_rotateX(62deg)_scale(1.35)]" />

      {/* accretion glow ring (teal) */}
      <div className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,transparent_50%,oklch(0.55_0.1_195/0.30)_58%,oklch(0.55_0.1_195/0.08)_68%,transparent_76%)]" />

      {/* event horizon disc — sized so the centered drop is framed, not buried */}
      <div className="absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.16_0.012_205)_0%,oklch(0.16_0.012_205)_58%,oklch(0.2_0.02_205_0.6)_82%,transparent_100%)] shadow-[0_0_70px_10px_oklch(0.2_0.02_205/0.55)]" />

      {/* thin teal photon ring */}
      <div className="absolute left-1/2 top-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/35" />
    </div>
  );
}
