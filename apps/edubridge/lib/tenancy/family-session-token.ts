import { createHmac, timingSafeEqual } from "node:crypto";
import { COOKIE_PREFIX } from "../brand";

/**
 * Family HMAC cookie contract (not a Supabase session).
 * `getSessionContext` never reads this cookie — Team/Fees stay staff-gated.
 */

export const FAMILY_COOKIE_NAME = `${COOKIE_PREFIX}.family`;
export const FAMILY_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Cookie + `parent_links` cap so the HMAC payload stays small. */
export const MAX_LINKED_STUDENTS = 8;

export type FamilyViewer = "student" | "parent";

export type FamilySessionPayload = {
  schoolId: string;
  viewer: FamilyViewer;
  studentIds: string[];
  activeStudentId: string;
  /** Opaque sibling group; parent sessions only. Not an auth user id. */
  familyId?: string;
  expiresAt: number;
};

export type FamilyCookieOrigin = {
  /** True when Host is `{slug}.{PLATFORM_DOMAIN}` or `{slug}.localhost`. */
  hostMode: boolean;
  schoolSlug: string;
};

function getSecret(): string {
  const secret = process.env.FAMILY_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("FAMILY_SESSION_SECRET must be set in production.");
  }
  return secret ?? "dev-family-session-secret-not-for-prod";
}

export function familyCookiePath(origin: FamilyCookieOrigin): string {
  const slug = origin.schoolSlug.trim().toLowerCase();
  if (origin.hostMode) {
    // School isolation is the host (`{slug}.edubridge.app`). Never Domain=.edubridge.app.
    return "/family";
  }
  return `/${slug}/family`;
}

export function familyCookieSetOptions(
  schoolSlug: string,
  origin: { hostMode: boolean },
): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: familyCookiePath({
      hostMode: origin.hostMode,
      schoolSlug,
    }),
    maxAge: Math.floor(FAMILY_SESSION_TTL_MS / 1000),
  };
}

function isViewer(value: unknown): value is FamilyViewer {
  return value === "student" || value === "parent";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isPayload(value: unknown): value is FamilySessionPayload {
  if (!value || typeof value !== "object") return false;
  const p = value as FamilySessionPayload;
  if (typeof p.schoolId !== "string" || p.schoolId.length === 0) return false;
  if (!isViewer(p.viewer)) return false;
  if (!Array.isArray(p.studentIds) || p.studentIds.length === 0) return false;
  if (!p.studentIds.every((id) => typeof id === "string" && id.length > 0)) {
    return false;
  }
  if (p.studentIds.length > MAX_LINKED_STUDENTS) return false;
  if (typeof p.activeStudentId !== "string") return false;
  if (!p.studentIds.includes(p.activeStudentId)) return false;
  if (typeof p.expiresAt !== "number") return false;
  if (p.viewer === "student") {
    if (p.studentIds.length !== 1) return false;
    if (p.familyId !== undefined) return false;
  }
  if (p.familyId !== undefined && !isUuid(p.familyId)) return false;
  return true;
}

export function signFamilyPayload(payload: FamilySessionPayload): string {
  const data = JSON.stringify(payload);
  const hmac = createHmac("sha256", getSecret()).update(data).digest("hex");
  return `${Buffer.from(data).toString("base64")}.${hmac}`;
}

export function verifyFamilyToken(token: string): FamilySessionPayload | null {
  const [dataB64, sig] = token.split(".");
  if (!dataB64 || !sig) return null;
  const data = Buffer.from(dataB64, "base64").toString();
  const expectedSig = createHmac("sha256", getSecret())
    .update(data)
    .digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const parsed: unknown = JSON.parse(data);
    if (!isPayload(parsed)) return null;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function payloadMatchesSchoolId(
  payload: FamilySessionPayload,
  schoolIdFromSlug: string,
): boolean {
  return payload.schoolId === schoolIdFromSlug;
}

/**
 * Isolation contract: a family HMAC cookie never satisfies staff
 * `getSessionContext` (Supabase `getUser` + `school_members` only).
 * Team and Fees stay staff-gated even when this token is valid.
 */
export function familyProofSatisfiesStaffContext(
  familyCookieValue: string | undefined,
): false {
  void familyCookieValue;
  return false;
}
