"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import {
  FAMILY_CARD_BLURB,
  FAMILY_CARD_ICON,
  FAMILY_CARD_TINT,
} from "../lib/family-destinations";
import { formatInr } from "../lib/format-inr";
import type { FamilyFeeHint, FamilyNavItem } from "../types";

type Props = {
  workspace: string;
  items: FamilyNavItem[];
  feeHint?: FamilyFeeHint;
};

function familyHref(workspace: string, href: string): string {
  return `/${workspace}${href}`;
}

export function FamilyDestinationGrid({ workspace, items, feeHint }: Props) {
  const reduce = useReducedMotion();

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = FAMILY_CARD_ICON[item.id] ?? ArrowUpRightIcon;
        const tint =
          FAMILY_CARD_TINT[item.id] ??
          "bg-secondary text-foreground";
        const blurb = FAMILY_CARD_BLURB[item.id] ?? item.title;
        const feeLine =
          item.id === "family-fees" && feeHint?.hasPlan
            ? feeHint.dueInr > 0
              ? `${formatInr(feeHint.dueInr)} due`
              : "No balance due"
            : null;

        return (
          <li key={item.id}>
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <Link
                href={familyHref(workspace, item.href)}
                className={cn(
                  "group flex min-h-36 flex-col justify-between gap-4 rounded-xl border border-border p-4",
                  tint,
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-background/70">
                    <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                  </span>
                  <ArrowUpRightIcon
                    className="size-4 opacity-50 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-serif text-xl tracking-tight">
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/75">
                    {feeLine ?? blurb}
                  </span>
                </span>
              </Link>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
