/** Brand mark variants for the particle-object hero. Preview-only; final choice replaces DEFAULT_BRAND_MARK. */
export interface BrandMarkVariant {
  id: string;
  label: string;
  src: string;
}

export const BRAND_MARK_VARIANTS: readonly [
  BrandMarkVariant,
  ...BrandMarkVariant[],
] = [
  { id: "drop", label: "Drop of Education", src: "/brand/logo-mark-drop.svg" },
  { id: "ring", label: "Ring of Education", src: "/brand/logo-mark-ring.svg" },
  {
    id: "edubridge-logo",
    label: "EduBridge Logo",
    src: "/brand/EduBridge_logo.svg",
  },
  { id: "current", label: "Current (Eye)", src: "/brand/logo-mark.svg" },
  { id: "emblem", label: "Circular Emblem", src: "/brand/logo-mark-emblem.svg" },
  { id: "arch", label: "Arch & Keystone", src: "/brand/logo-mark-arch.svg" },
  { id: "book", label: "Book Bridge", src: "/brand/logo-mark-book.svg" },
];

export const DEFAULT_BRAND_MARK_ID = "drop";
