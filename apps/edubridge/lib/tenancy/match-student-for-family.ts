import { and, eq, getDb, schools, students } from "@repo/db";

/** Same copy for miss, wrong DOB, other school, and rate-limit. */
export const FAMILY_MATCH_GENERIC_ERROR = "details don’t match";

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_ATTEMPTS = 8;

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

export type FamilyMatchOk = {
  ok: true;
  studentId: string;
  schoolId: string;
};

export type FamilyMatchMiss = {
  ok: false;
  error: typeof FAMILY_MATCH_GENERIC_ERROR;
};

export type FamilyMatchResult = FamilyMatchOk | FamilyMatchMiss;

export type MatchStudentForFamilyInput = {
  schoolSlug: string;
  admissionNumber: string;
  dateOfBirth: string;
  /** Client IP for rate-limit (combined with admission + slug, never IP alone). */
  ip: string;
};

const miss = (): FamilyMatchMiss => ({
  ok: false,
  error: FAMILY_MATCH_GENERIC_ERROR,
});

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeAdmission(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

function normalizeDob(value: string): string | null {
  const dob = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  return dob;
}

function rateKey(ip: string, admission: string, slug: string): string {
  const client = ip.trim() || "unknown";
  return `${client}\0${admission}\0${slug}`;
}

function consumeRateLimit(key: string): boolean {
  const now = Date.now();
  if (rateBuckets.size > 2000) {
    for (const [k, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(k);
    }
  }
  const existing = rateBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  existing.count += 1;
  return existing.count > RATE_MAX_ATTEMPTS;
}

/**
 * Headless family proof: school from URL slug only (never client schoolId).
 * Always constrains `students` by that school's id. Generic error on miss.
 */
export async function matchStudentForFamily(
  input: MatchStudentForFamilyInput,
): Promise<FamilyMatchResult> {
  const schoolSlug = normalizeSlug(input.schoolSlug);
  const admissionNumber = normalizeAdmission(input.admissionNumber);
  const dateOfBirth = normalizeDob(input.dateOfBirth);

  if (!schoolSlug || !admissionNumber || !dateOfBirth) {
    return miss();
  }

  if (consumeRateLimit(rateKey(input.ip, admissionNumber, schoolSlug))) {
    return miss();
  }

  const db = getDb();
  const schoolRows = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, schoolSlug))
    .limit(1);

  const school = schoolRows[0];
  if (!school) return miss();

  const studentRows = await db
    .select({
      id: students.id,
      schoolId: students.schoolId,
      admissionNumber: students.admissionNumber,
    })
    .from(students)
    .where(
      and(
        eq(students.schoolId, school.id),
        eq(students.dateOfBirth, dateOfBirth),
      ),
    );

  const matches = studentRows.filter(
    (row) => normalizeAdmission(row.admissionNumber) === admissionNumber,
  );
  // ponytail: same-DOB scan; generated unique on stripped admission if collisions appear
  if (matches.length !== 1) return miss();
  const student = matches[0];
  if (!student) return miss();

  return {
    ok: true,
    studentId: student.id,
    schoolId: student.schoolId,
  };
}
