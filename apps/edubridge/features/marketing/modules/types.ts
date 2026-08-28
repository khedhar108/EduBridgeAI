/**
 * Marketing module articles — plain JSON-serializable data only.
 * Safe to pass Server → Client and later map 1:1 to a DB/CMS row.
 *
 * Edit copy here for now. When CMS lands, keep this shape as the DTO.
 */

/** Reserved media region — set `src` when assets land under public/marketing/modules. */
export type ModuleMediaSlotContent = {
  label: string;
  /** CSS aspect-ratio, e.g. "16 / 9" */
  aspect?: string;
  /** Optional public path or remote URL */
  src?: string;
  alt?: string;
};

export type ModulePageSection = {
  heading: string;
  body: string;
  media?: ModuleMediaSlotContent;
};

/** Icon keys resolved on the client — never pass Lucide components across RSC. */
export type ModuleIconName =
  | "layout-dashboard"
  | "sparkles"
  | "calendar-days"
  | "clipboard-list"
  | "wallet"
  | "receipt"
  | "file-text";

/**
 * Blog-style module article. Slug route: `/modules/[slug]`.
 * All fields must stay JSON-serializable (no functions / class instances).
 */
export type ModulePage = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  audience: string;
  readingMinutes: number;
  icon: ModuleIconName;
  hero: ModuleMediaSlotContent;
  highlights: string[];
  sections: ModulePageSection[];
};
