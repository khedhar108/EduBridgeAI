import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, getDb, schools } from "@repo/db";
import {
  FAMILY_COOKIE_NAME,
  FAMILY_SESSION_TTL_MS,
  familyCookieSetOptions,
  payloadMatchesSchoolId,
  signFamilyPayload,
  verifyFamilyToken,
  type FamilySessionPayload,
} from "./family-session-token";

export {
  FAMILY_COOKIE_NAME,
  FAMILY_SESSION_TTL_MS,
  MAX_LINKED_STUDENTS,
  familyCookiePath,
  familyCookieSetOptions,
  familyProofSatisfiesStaffContext,
  payloadMatchesSchoolId,
  signFamilyPayload,
  verifyFamilyToken,
  type FamilyCookieOrigin,
  type FamilySessionPayload,
  type FamilyViewer,
} from "./family-session-token";

export type FamilySessionInput = Omit<FamilySessionPayload, "expiresAt">;

/**
 * Signed family cookie. Copies the impersonation HMAC *shape*, not meaning:
 * this cookie is the only family credential and never grants staff context.
 *
 * Origin-aware Path (PWA-safe): prod `Path=/family` on `{slug}.edubridge.app`
 * (never `Domain=.edubridge.app`); local `Path=/{slug}/family`.
 * TTL (~30 days) is set at sign-in. Reads do not write cookies (RSC-safe).
 */
export async function setFamilySessionCookie(
  payload: FamilySessionInput,
  origin: { schoolSlug: string },
): Promise<void> {
  const fullPayload: FamilySessionPayload = {
    ...payload,
    expiresAt: Date.now() + FAMILY_SESSION_TTL_MS,
  };
  const cookieStore = await cookies();
  cookieStore.set(
    FAMILY_COOKIE_NAME,
    signFamilyPayload(fullPayload),
    familyCookieSetOptions(origin.schoolSlug),
  );
}

/**
 * Read + verify the family cookie, then re-check `schoolId` against the URL
 * slug (never trust the payload school alone). RSC-safe: does not set cookies.
 */
export const getFamilySession = cache(
  async (schoolSlug: string): Promise<FamilySessionPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(FAMILY_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyFamilyToken(token);
    if (!payload) return null;

    const db = getDb();
    const schoolRows = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.slug, schoolSlug.trim().toLowerCase()))
      .limit(1);

    const school = schoolRows[0];
    if (!school || !payloadMatchesSchoolId(payload, school.id)) {
      return null;
    }

    return payload;
  },
);

/** Nested family routes: missing cookie → door. */
export async function requireFamilySession(
  schoolSlug: string,
): Promise<FamilySessionPayload> {
  const session = await getFamilySession(schoolSlug);
  if (!session) {
    redirect(`/${schoolSlug.trim().toLowerCase()}/family`);
  }
  return session;
}

export async function clearFamilySessionCookie(schoolSlug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(FAMILY_COOKIE_NAME, "", {
    ...familyCookieSetOptions(schoolSlug),
    maxAge: 0,
  });
}
