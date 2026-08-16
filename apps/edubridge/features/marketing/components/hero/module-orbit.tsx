"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { type MarketingModule } from "../../content/modules";
import { ORBIT_RINGS, slotsForRing, type OrbitRing } from "./orbit-data";

function OrbitChip({
  ring,
  angle,
  Icon,
  title,
  summary,
  href,
}: {
  ring: OrbitRing;
  angle: number;
  Icon: MarketingModule["Icon"];
  title: string;
  summary: string;
  href: string;
}) {
  const reduce = useReducedMotion();
  const spin = 360 * ring.direction;
  const placement = `translate(-50%, -50%) rotate(${angle}deg) translateX(${ring.radius}vmin)`;

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{ transform: placement }}
    >
      {/* counter-spin undoes the ring rotation */}
      <motion.div
        animate={reduce ? undefined : { rotate: -spin }}
        transition={{ repeat: Infinity, ease: "linear", duration: ring.duration }}
      >
        {/* untile undoes the placement angle so chips render upright */}
        <div style={{ transform: `rotate(${-angle}deg)` }}>
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.08 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="group relative"
          >
            <Link
              href={href}
              aria-label={title}
              className="flex w-[7.5rem] cursor-pointer flex-col items-center gap-2 rounded-xl border border-border/80 bg-background/85 p-3 text-center backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden strokeWidth={1.75} />
              </span>
              <span className="text-xs font-medium leading-tight text-foreground">
                {title}
              </span>
            </Link>
            {/* summary tooltip — pointer:fine only, no hover dependency for touch */}
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-44 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 text-[0.6875rem] leading-relaxed text-muted-foreground shadow-sm group-hover:block">
              {summary}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function Ring({ ring }: { ring: OrbitRing }) {
  const reduce = useReducedMotion();
  const slots = slotsForRing(ring.id);
  const spin = 360 * ring.direction;

  return (
    <motion.div
      className="absolute inset-0"
      animate={reduce ? undefined : { rotate: spin }}
      transition={{ repeat: Infinity, ease: "linear", duration: ring.duration }}
    >
      {slots.map(({ module, angle }) => (
        <OrbitChip
          key={module.id}
          ring={ring}
          angle={angle}
          Icon={module.Icon}
          title={module.title}
          summary={module.summary}
          href={module.href}
        />
      ))}
    </motion.div>
  );
}

/**
 * Orbit stage: three concentric rings of module chips around the well.
 * Chips stay upright (counter-spin + untile). Reduced motion freezes to a
 * static composed arrangement. Hidden below lg; copy + droplet carry mobile.
 */
export function ModuleOrbit({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative hidden aspect-square w-full max-w-[64vmin] lg:block",
        className,
      )}
      aria-hidden
    >
      {/* faint orbit lane guides */}
      {ORBIT_RINGS.map((ring) => (
        <div
          key={ring.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/40"
          style={{ width: `${ring.radius * 2}vmin`, height: `${ring.radius * 2}vmin` }}
        />
      ))}

      {/* chips need pointer events even though the stage is decorative-laned */}
      <div className="pointer-events-auto absolute inset-0">
        {ORBIT_RINGS.map((ring) => (
          <Ring key={ring.id} ring={ring} />
        ))}
      </div>
    </div>
  );
}
