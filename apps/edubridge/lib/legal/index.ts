export {
  LEGAL_ENTITY_NAME,
  LEGAL_DOCS_IN_FORCE,
  REGISTERED_ADDRESS,
  REGISTERED_PIN,
  REGISTERED_DISTRICT,
  REGISTERED_STATE,
  FORUM_COURT,
  GOVERNING_LAW,
  GRIEVANCE_EMAIL,
  PRIVACY_EMAIL,
  TERMS_VERSION,
  PRIVACY_VERSION,
  COOKIES_VERSION,
  DPA_ROLE_SCHOOL,
  DPA_ROLE_PLATFORM,
  LIABILITY_FLOOR_INR,
  operatorParty,
  forumLine,
  registeredOfficeLine,
} from "./constants";

export { TERMS_PATH, PRIVACY_PATH, COOKIES_PATH } from "./paths";

export {
  COOKIE_INVENTORY,
  CONSENT_COOKIE_NAME,
  COOKIE_PREFS_EVENT,
  FAMILY_COOKIE_NAME,
  IMPERSONATION_COOKIE_NAME,
  REMEMBER_CREDS_KEY,
  type CookieCategory,
  type CookieInventoryItem,
  type CookieKind,
} from "./cookie-inventory";

export {
  parseConsent,
  serializeConsent,
  readConsentFromDocument,
  writeConsentToDocument,
  type ConsentState,
  type CookieChoice,
} from "./consent";
