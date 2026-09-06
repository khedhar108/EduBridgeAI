/**
 * Door 2 seed tests (no family UI).
 *
 *   pnpm --filter @repo/db test:family-match
 *
 * Requires DATABASE_URL (packages/db/.env) and a seeded database
 * (`pnpm seed:dev`). Does not call db:migrate / db:generate.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import {
  FAMILY_MATCH_GENERIC_ERROR,
  matchStudentForFamily,
} from "../../../apps/edubridge/lib/tenancy/match-student-for-family.ts";
import {
  FAMILY_COOKIE_NAME,
  familyCookiePath,
  familyCookieSetOptions,
  familyProofSatisfiesStaffContext,
  payloadMatchesSchoolId,
  signFamilyPayload,
  verifyFamilyToken,
} from "../../../apps/edubridge/lib/tenancy/family-session-token.ts";

const PILOT_SLUG = "edubridge-pilot-bridge";
const OAKWOOD_SLUG = "oakwood-academy-bridge";
const ADMISSION = "EBS-2024-006";
const DOB = "2013-06-06";

let failed = 0;

function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      process.stdout.write(`ok  ${name}\n`);
    })
    .catch((error: unknown) => {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`FAIL ${name}: ${message}\n`);
    });
}

await check("pilot + EBS-2024-006 + 2013-06-06 matches", async () => {
  const result = await matchStudentForFamily({
    schoolSlug: PILOT_SLUG,
    admissionNumber: ADMISSION,
    dateOfBirth: DOB,
    ip: "test-match-1",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(typeof result.studentId, "string");
  assert.ok(result.studentId.length > 0);
  assert.equal(typeof result.schoolId, "string");
});

await check("hyphens optional: EBS2024006 matches seeded EBS-2024-006", async () => {
  const result = await matchStudentForFamily({
    schoolSlug: PILOT_SLUG,
    admissionNumber: "EBS2024006",
    dateOfBirth: DOB,
    ip: "test-match-hyphen",
  });
  assert.equal(result.ok, true);
});

await check("wrong DOB → generic error, no row", async () => {
  const result = await matchStudentForFamily({
    schoolSlug: PILOT_SLUG,
    admissionNumber: ADMISSION,
    dateOfBirth: "2013-06-07",
    ip: "test-match-2",
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, FAMILY_MATCH_GENERIC_ERROR);
});

await check("same admission on oakwood-academy-bridge → no match", async () => {
  const result = await matchStudentForFamily({
    schoolSlug: OAKWOOD_SLUG,
    admissionNumber: ADMISSION,
    dateOfBirth: DOB,
    ip: "test-match-3",
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, FAMILY_MATCH_GENERIC_ERROR);
});

await check("family cookie HMAC + origin-aware path", () => {
  const payload = {
    schoolId: "11111111-1111-4111-8111-111111111111",
    viewer: "parent" as const,
    studentIds: ["22222222-2222-4222-8222-222222222222"],
    activeStudentId: "22222222-2222-4222-8222-222222222222",
    familyId: "33333333-3333-4333-8333-333333333333",
    expiresAt: Date.now() + 60_000,
  };
  const token = signFamilyPayload(payload);
  const verified = verifyFamilyToken(token);
  assert.ok(verified);
  assert.equal(verified?.schoolId, payload.schoolId);
  assert.equal(verified?.viewer, "parent");
  assert.equal(verified?.familyId, payload.familyId);
  assert.equal(FAMILY_COOKIE_NAME, "edubridge.family");

  assert.equal(
    familyCookiePath({ hostMode: true, schoolSlug: PILOT_SLUG }),
    "/family",
  );
  assert.equal(
    familyCookiePath({ hostMode: false, schoolSlug: PILOT_SLUG }),
    `/${PILOT_SLUG}/family`,
  );

  const opts = familyCookieSetOptions(PILOT_SLUG, { hostMode: false });
  assert.equal(opts.httpOnly, true);
  assert.equal(opts.sameSite, "lax");
  assert.ok(!("domain" in opts));
  assert.equal(payloadMatchesSchoolId(payload, payload.schoolId), true);
  assert.equal(payloadMatchesSchoolId(payload, "other-school"), false);
});

await check("family cookie does not satisfy staff context", async () => {
  const token = signFamilyPayload({
    schoolId: "11111111-1111-4111-8111-111111111111",
    viewer: "student",
    studentIds: ["22222222-2222-4222-8222-222222222222"],
    activeStudentId: "22222222-2222-4222-8222-222222222222",
    expiresAt: Date.now() + 60_000,
  });
  assert.equal(familyProofSatisfiesStaffContext(token), false);
  assert.equal(familyProofSatisfiesStaffContext(undefined), false);

  const sessionContextPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../apps/edubridge/lib/tenancy/session-context.ts",
  );
  const sessionSrc = await readFile(sessionContextPath, "utf8");
  assert.ok(
    sessionSrc.includes("edubridge.family"),
    "session-context must document that the family cookie is ignored",
  );
  assert.equal(
    sessionSrc.includes("from \"./family-session"),
    false,
    "getSessionContext must not import family-session",
  );
  assert.equal(
    sessionSrc.includes("FAMILY_COOKIE_NAME"),
    false,
    "getSessionContext must not read FAMILY_COOKIE_NAME",
  );
  assert.ok(sessionSrc.includes("requireUser"));
  assert.ok(sessionSrc.includes("getImpersonation"));
});

if (failed > 0) {
  process.stderr.write(`\n${failed} family-door test(s) failed.\n`);
  process.exit(1);
}

process.stdout.write("\nFamily door tests passed (match + cookie isolate).\n");
process.exit(0);
