"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import {
  MARKETING_MODULES,
  type MarketingModule,
} from "../content/modules";
import { MODULE_TINT_CLASSES } from "./module-tints";

const SPAN: Record<MarketingModule["span"], string> = {
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  default: "",
};

function ModuleCard({ mod }: { mod: MarketingModule }) {
  const reduce = useReducedMotion();
  const Icon = mod.Icon;

  return (
    <motion.div
      className={cn("h-full", SPAN[mod.span])}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <Link
        href={mod.href}
        className={cn(
          "group relative flex h-full min-h-44 cursor-pointer flex-col justify-between gap-6 overflow-hidden rounded-xl border border-border p-5 transition-colors duration-200 hover:border-current/30 sm:min-h-52 sm:p-6",
          MODULE_TINT_CLASSES[mod.tint],
          mod.span === "tall" && "md:min-h-full",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-current opacity-10 blur-2xl"
        />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-background/70 text-current shadow-[0_1px_0_oklch(0_0_0/0.04)]">
            <Icon className="size-5" aria-hidden strokeWidth={1.75} />
          </span>
          <span className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/60 text-muted-foreground transition-colors duration-200 group-hover:border-current/40 group-hover:text-current">
            <ArrowUpRightIcon className="size-4" aria-hidden />
          </span>
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <h3 className="font-serif text-xl tracking-tight text-current sm:text-2xl">
            {mod.title}
          </h3>
          <p className="max-w-prose text-sm leading-relaxed text-foreground/75">
            {mod.summary}
          </p>
          <p className="text-xs text-foreground/70">
            Read the overview
            <span className="sr-only">: {mod.title}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Interactive module bento. Cards are the interaction surface (MASTER allows
 * cards when they hold a user action). Each card routes to a module showcase.
 *
 * No whileInView stagger — particle-scroll owns section reveal on `/`.
 */
export function MarketingModuleCards({
  modules = MARKETING_MODULES,
}: {
  modules?: readonly MarketingModule[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-[minmax(11rem,auto)] lg:grid-cols-3 lg:gap-5">
      {modules.map((mod) => (
        <ModuleCard key={mod.id} mod={mod} />
      ))}
    </div>
  );
}
