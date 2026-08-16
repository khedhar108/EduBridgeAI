"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { DropMark } from "../brand/drop-mark";
import { ParticleObjectBrandLazy } from "../canvasui/particle-object-brand-lazy";

const DROP_SRC = "/brand/logo-mark-drop-v2.svg";

/**
 * Bottom hero piece: the Drop of Education emerging from the well.
 * Owns the WebGL particle animation (default) and the static reduced-motion
 * / fallback render, so the parent just drops the tag in.
 */
export function DropOfEducation({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      initial={reduce ? false : { opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      {/* soft well glow behind the drop */}
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.1_195/0.18),transparent_70%)] blur-2xl" />

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
