import { CONSENT_COOKIE_NAME } from "./cookie-inventory";

export type CookieChoice = "necessary" | "all";

export type ConsentState = {
  termsVersion?: string;
  cookies?: CookieChoice;
  at: string;
};

export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseConsent(raw: string | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.at !== "string") return null;
    const cookies =
      parsed.cookies === "necessary" || parsed.cookies === "all"
        ? parsed.cookies
        : undefined;
    const termsVersion =
      typeof parsed.termsVersion === "string" ? parsed.termsVersion : undefined;
    return { at: parsed.at, cookies, termsVersion };
  } catch {
    return null;
  }
}

export function serializeConsent(state: ConsentState): string {
  return JSON.stringify(state);
}

export function consentCookieSetOptions(): {
  path: "/";
  sameSite: "lax";
  maxAge: number;
  secure: boolean;
} {
  return {
    path: "/",
    sameSite: "lax",
    maxAge: CONSENT_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

export function readConsentFromDocument(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  const part = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  if (!part) return null;
  return parseConsent(decodeURIComponent(part.slice(prefix.length)));
}

export function writeConsentToDocument(state: ConsentState): void {
  if (typeof document === "undefined") return;
  const { path, sameSite, maxAge, secure } = consentCookieSetOptions();
  const secureAttr = secure ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serializeConsent(state))}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}${secureAttr}`;
}

export { CONSENT_COOKIE_NAME };
