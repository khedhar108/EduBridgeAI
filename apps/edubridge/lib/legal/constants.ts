import { PLATFORM_DOMAIN, PLATFORM_NAME } from "@/lib/brand";

/** Contracting party. Not the display brand — that is PLATFORM_NAME in lib/brand.ts. */
export const LEGAL_ENTITY_NAME = "";

/**
 * Flip only after LEGAL_ENTITY_NAME is real and a human reviewed the copy.
 * While false, pages are draft and do not form a contract.
 */
export const LEGAL_DOCS_IN_FORCE = false;

/** Street line; leave empty when only district/PIN are known. */
export const REGISTERED_ADDRESS = "";

export const REGISTERED_PIN = "333022";

export const REGISTERED_DISTRICT = "Jhunjhunu";

export const REGISTERED_STATE = "Rajasthan";

export const FORUM_COURT = "District Court, Jhunjhunu";

export const GOVERNING_LAW = "the laws of India";

export const GRIEVANCE_EMAIL = `legal@${PLATFORM_DOMAIN}`;

export const PRIVACY_EMAIL = `privacy@${PLATFORM_DOMAIN}`;

/** Bump when Terms section prose changes; login re-prompts on mismatch. */
export const TERMS_VERSION = "2026-08-29";

export const PRIVACY_VERSION = "2026-08-29";

export const COOKIES_VERSION = "2026-08-29";

/** DPDP Act 2023 roles — do not invert these without a research ticket. */
export const DPA_ROLE_SCHOOL = "Data Fiduciary";

export const DPA_ROLE_PLATFORM = "Data Processor";

export const LIABILITY_FLOOR_INR = "10,000";

export function operatorParty(): string {
  const name = LEGAL_ENTITY_NAME.trim();
  if (name) return name;
  return `the operator of ${PLATFORM_NAME} (legal identity to be inserted)`;
}

export function forumLine(): string {
  return `${FORUM_COURT}, ${REGISTERED_DISTRICT}, ${REGISTERED_STATE}, PIN ${REGISTERED_PIN}`;
}

export function registeredOfficeLine(): string {
  const street = REGISTERED_ADDRESS.trim();
  const tail = `${REGISTERED_DISTRICT}, ${REGISTERED_STATE}, PIN ${REGISTERED_PIN}`;
  return street ? `${street}, ${tail}` : tail;
}
