import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

/** Local pastel surfaces — not shared tokens. Product chrome stays one accent. */
export const FAMILY_CARD_TINT: Record<string, string> = {
  "family-fees": "bg-[oklch(0.955_0.03_180)] text-[oklch(0.32_0.06_180)]",
  "family-progress": "bg-[oklch(0.952_0.035_235)] text-[oklch(0.34_0.07_235)]",
  "family-exams": "bg-[oklch(0.955_0.04_90)] text-[oklch(0.4_0.09_80)]",
  "family-events": "bg-[oklch(0.95_0.035_300)] text-[oklch(0.34_0.08_300)]",
};

export const FAMILY_CARD_ICON: Record<string, LucideIcon> = {
  "family-fees": WalletIcon,
  "family-progress": TrendingUpIcon,
  "family-exams": BookOpenIcon,
  "family-events": CalendarDaysIcon,
};

export const FAMILY_CARD_BLURB: Record<string, string> = {
  "family-fees": "Dues, scholarship, and payments recorded at the office",
  "family-progress": "Attendance and how this child is doing this year",
  "family-exams": "Tests, half-yearly, and final exam marks",
  "family-events": "Circulars, functions, and dates for this class",
};
