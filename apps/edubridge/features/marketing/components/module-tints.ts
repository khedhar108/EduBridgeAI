import { MARKETING_MODULES, type MarketingModule } from "../content/modules";

export type ModuleTint = MarketingModule["tint"];

/**
 * Curated light-theme pastel surface tints — one hue per module card.
 * Marketing-only decoration; the hero uses the same arbitrary-oklch precedent.
 * Each entry pairs a soft pastel surface with a deep, hue-matched ink so
 * text and icon accents stay legible (>=4.5:1) without a second brand accent.
 */
export const MODULE_TINT_CLASSES: Record<ModuleTint, string> = {
  mint: "bg-[oklch(0.955_0.03_180)] text-[oklch(0.32_0.06_180)]",
  sky: "bg-[oklch(0.952_0.035_235)] text-[oklch(0.34_0.07_235)]",
  amber: "bg-[oklch(0.955_0.04_90)] text-[oklch(0.4_0.09_80)]",
  rose: "bg-[oklch(0.955_0.03_15)] text-[oklch(0.36_0.07_15)]",
  violet: "bg-[oklch(0.95_0.035_300)] text-[oklch(0.34_0.08_300)]",
  stone: "bg-[oklch(0.952_0.006_100)] text-[oklch(0.3_0.02_205)]",
};

const TINT_BY_MODULE: Record<string, ModuleTint> = Object.fromEntries(
  MARKETING_MODULES.map((m) => [m.id, m.tint]),
);

/** Resolve a module's pastel tint by its slug (falls back to neutral stone). */
export function getModuleTint(slug: string): ModuleTint {
  return TINT_BY_MODULE[slug] ?? "stone";
}
