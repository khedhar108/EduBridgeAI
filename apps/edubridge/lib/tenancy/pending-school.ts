export const PENDING_SCHOOL_META_KEY = "eb_pending_school";

export type PendingSchoolRegistration = {
  name: string;
  slug: string;
  country: string;
  state: string;
  city: string;
  pincode: string | null;
  fullName: string;
  username: string;
};

function isNonEmptyString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.length <= max;
}

export function parsePendingSchool(
  metadata: unknown,
): PendingSchoolRegistration | null {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = (metadata as Record<string, unknown>)[PENDING_SCHOOL_META_KEY];
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (
    !isNonEmptyString(row.name, 160) ||
    !isNonEmptyString(row.slug, 120) ||
    !isNonEmptyString(row.state, 80) ||
    !isNonEmptyString(row.city, 80) ||
    !isNonEmptyString(row.fullName, 160) ||
    typeof row.username !== "string"
  ) {
    return null;
  }
  const country = typeof row.country === "string" ? row.country : "IN";
  const pincode =
    typeof row.pincode === "string" && /^\d{6}$/.test(row.pincode)
      ? row.pincode
      : null;
  return {
    name: row.name.trim(),
    slug: row.slug.trim().toLowerCase(),
    country: /^[A-Z]{2}$/.test(country) ? country : "IN",
    state: row.state.trim(),
    city: row.city.trim(),
    pincode,
    fullName: row.fullName.trim(),
    username: row.username.trim().toLowerCase(),
  };
}

export function pendingSchoolMetadata(
  pending: PendingSchoolRegistration,
): Record<string, unknown> {
  return { [PENDING_SCHOOL_META_KEY]: pending };
}
