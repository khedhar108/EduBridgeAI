import { cookies } from "next/headers";
import {
  consentCookieSetOptions,
  parseConsent,
  serializeConsent,
  type ConsentState,
  type CookieChoice,
} from "./consent";
import { CONSENT_COOKIE_NAME } from "./cookie-inventory";

async function readStored(): Promise<ConsentState | null> {
  const jar = await cookies();
  return parseConsent(jar.get(CONSENT_COOKIE_NAME)?.value);
}

async function writeStored(next: ConsentState): Promise<void> {
  const jar = await cookies();
  jar.set(CONSENT_COOKIE_NAME, serializeConsent(next), {
    ...consentCookieSetOptions(),
    httpOnly: false,
  });
}

export async function persistTermsAcceptance(version: string): Promise<void> {
  const existing = await readStored();
  await writeStored({
    termsVersion: version,
    cookies: existing?.cookies,
    at: new Date().toISOString(),
  });
}

export async function persistCookieChoice(choice: CookieChoice): Promise<void> {
  const existing = await readStored();
  await writeStored({
    termsVersion: existing?.termsVersion,
    cookies: choice,
    at: new Date().toISOString(),
  });
}
