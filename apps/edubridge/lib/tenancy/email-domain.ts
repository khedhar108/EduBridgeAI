/** Consumer inboxes never count as a school domain for auto-join requests. */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
]);

export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

export function isFreeEmailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.has(domain.toLowerCase());
}

/**
 * School/business inbox for register and domain-join.
 * Local (`NODE_ENV=development`): any non-empty domain so test inboxes work.
 * Production build (Vercel staging + Coolify): reject free providers.
 */
export function isEligibleSchoolEmailDomain(domain: string): boolean {
  if (!domain) return false;
  if (process.env.NODE_ENV !== "production") return true;
  return !isFreeEmailDomain(domain);
}

export function schoolEmailGateError(email: string): string | null {
  const domain = emailDomain(email);
  if (!domain) return "Enter a valid email address.";
  if (!isEligibleSchoolEmailDomain(domain)) {
    return "Use your official school or business email (not Gmail, Yahoo, Outlook, or other personal inboxes).";
  }
  return null;
}
