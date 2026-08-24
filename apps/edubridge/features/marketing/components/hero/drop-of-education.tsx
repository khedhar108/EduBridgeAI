"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { DropMark } from "../brand/drop-mark";
import { ParticleObjectBrandLazy } from "../canvasui/particle-object-brand-lazy";

const DROP_SRC = "/brand/logo-mark-drop.svg";

/**
 * The Drop of Education, centered at the black hole singularity.
 * WebGL particle cloud (default) with a static reduced-motion fallback.
 * Scale/fade entrance so it reads as forming at the core, not sliding in.
 */
export function DropOfEducation({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      initial={reduce ? false : { opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      {/* singularity glow behind the drop */}
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.1_195/0.22),transparent_70%)] blur-2xl" />

      {reduce ? (
        <DropMark className="mx-auto size-40" />
      ) : (
        <ParticleObjectBrandLazy
          className="relative h-56 w-56 sm:h-64 sm:w-64"
          src={DROP_SRC}
        />
      )}
    </motion.div>
  );
}
