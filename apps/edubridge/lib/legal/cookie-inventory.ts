import { COOKIE_PREFIX } from "@/lib/brand";

export type CookieCategory = "necessary" | "optional";

export type CookieKind = "cookie" | "localStorage";

export type CookieInventoryItem = {
  id: string;
  name: string;
  kind: CookieKind;
  category: CookieCategory;
  purpose: string;
  ttl: string;
};

export const CONSENT_COOKIE_NAME = `${COOKIE_PREFIX}.consent`;

/** Footer and cookie banner share this to reopen preferences. */
export const COOKIE_PREFS_EVENT = `${COOKIE_PREFIX}:cookie-preferences`;

export const FAMILY_COOKIE_NAME = `${COOKIE_PREFIX}.family`;

export const IMPERSONATION_COOKIE_NAME = `${COOKIE_PREFIX}.impersonation`;

export const REMEMBER_CREDS_KEY = `${COOKIE_PREFIX}.remembered-creds`;

export const COOKIE_INVENTORY: CookieInventoryItem[] = [
  {
    id: "supabase-auth",
    name: "sb-*",
    kind: "cookie",
    category: "necessary",
    purpose: "Staff and platform sign-in session (Supabase Auth).",
    ttl: "Set by the auth provider (session / refresh).",
  },
  {
    id: "family",
    name: FAMILY_COOKIE_NAME,
    kind: "cookie",
    category: "necessary",
    purpose: "Parent or student family session after admission number and date of birth proof.",
    ttl: "About 30 days from sign-in.",
  },
  {
    id: "impersonation",
    name: IMPERSONATION_COOKIE_NAME,
    kind: "cookie",
    category: "necessary",
    purpose: "Short-lived admin impersonation of a staff identity inside one school.",
    ttl: "30 minutes.",
  },
  {
    id: "consent",
    name: CONSENT_COOKIE_NAME,
    kind: "cookie",
    category: "necessary",
    purpose: "Stores cookie-category choice and the Terms version last acknowledged.",
    ttl: "1 year.",
  },
  {
    id: "remember",
    name: REMEMBER_CREDS_KEY,
    kind: "localStorage",
    category: "optional",
    purpose:
      "Optional “Remember me” on staff sign-in. Set only if you tick that box; not controlled by the cookie banner.",
    ttl: "7 days.",
  },
];
