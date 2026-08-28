/**
 * Pure username utilities — safe to import from client components
 * (no database imports). Query helpers live in actions/check-username.
 */

/** Mirrors the `profiles_username_format` check in the database. */
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,62}[a-z0-9])$/;

/** Strip anything the username format forbids (lowercase, keep [a-z0-9._-]). */
export function sanitizeUsernameInput(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

/** Client-usable validation (no DB). Returns an error message or null. */
export function validateUsername(value: string): string | null {
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 64) return "Username must be at most 64 characters.";
  if (!USERNAME_PATTERN.test(value)) {
    return "Use lowercase letters, numbers, dots, dashes or underscores; start and end with a letter or number.";
  }
  return null;
}

/**
 * Deterministic username suggestion from an email's local part — never
 * random. `Vikram.S@pilot-school.edu` → `vikram.s`. Empty when nothing
 * usable can be derived.
 */
export function suggestUsername(email: string): string {
  const local = (email.split("@")[0] ?? "").toLowerCase();
  return local
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9]+$/, "")
    .slice(0, 64);
}
