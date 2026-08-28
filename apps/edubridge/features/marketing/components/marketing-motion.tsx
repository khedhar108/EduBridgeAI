"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export type ScrollDirection = "up" | "down";

function offsetY(direction: ScrollDirection, distance: number) {
  return direction === "up" ? distance : -distance;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** `up` = rises into place (default). `down` = settles downward into place. */
  direction?: ScrollDirection;
  distance?: number;
  once?: boolean;
  amount?: number;
};

/**
 * Reusable scroll reveal for marketing sections.
 * Works on document scroll (not Canvas UI particle-scroll).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 28,
  once = true,
  amount = 0.25,
}: RevealProps) {
  const reduce = useReducedMotion();
  const y = offsetY(direction, distance);

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  once?: boolean;
  amount?: number;
  stagger?: number;
};

/** Parent for staggered children — pair with `StaggerItem`. */
export function Stagger({
  children,
  className,
  once = true,
  amount = 0.15,
  stagger = 0.08,
}: StaggerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  direction?: ScrollDirection;
  distance?: number;
};

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 22,
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  const y = offsetY(direction, distance);

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type HeroEntranceProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: ScrollDirection;
  distance?: number;
};

/** First-paint hero entrance (not scroll-triggered). */
export function HeroEntrance({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 20,
}: HeroEntranceProps) {
  const reduce = useReducedMotion();
  const y = offsetY(direction, distance);

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
