"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import {
  MARKETING_MODULES,
  type MarketingModule,
} from "../content/modules";

const TINT: Record<MarketingModule["tint"], string> = {
  primary: "bg-primary/8 hover:bg-primary/12",
  muted: "bg-muted/80 hover:bg-muted",
  accent: "bg-accent/70 hover:bg-accent",
};

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
          "group relative flex h-full min-h-44 cursor-pointer flex-col justify-between gap-6 overflow-hidden rounded-xl border border-border p-5 transition-colors duration-200 sm:min-h-52 sm:p-6",
          TINT[mod.tint],
          mod.span === "tall" && "md:min-h-full",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-background/80 text-primary shadow-[0_1px_0_oklch(0_0_0/0.04)]">
            <Icon className="size-5" aria-hidden strokeWidth={1.75} />
          </span>
          <span className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/60 text-muted-foreground transition-colors duration-200 group-hover:border-primary/30 group-hover:text-primary">
            <ArrowUpRightIcon className="size-4" aria-hidden />
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
            {mod.title}
          </h3>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {mod.summary}
          </p>
          <p className="text-xs text-muted-foreground/80">
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
