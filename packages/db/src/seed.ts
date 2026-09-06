import { and, eq, sql } from "drizzle-orm";
import { closeDb, getDb } from "./client";
import {
  classEnrollments,
  classes,
  classStaffDelegations,
  classSubjects,
  profiles,
  schoolMembers,
  schools,
  studentGuardians,
  students,
  subjects,
  teacherAssignments,
} from "./schema";

const ACADEMIC_YEAR = "2024-25";
const PASSWORD = "TestLogin123!";
const SEED_SUBJECTS = [
  "English",
  "Mathematics",
  "Science",
  "Social Science",
  "Hindi",
] as const;

type Account = {
  uuid: string;
  email: string;
  username: string;
  fullName: string;
  role: string | null;
  schoolSlug: string | null;
  isPlatformOwner?: boolean;
};

const schoolRecords = [
  {
    name: "EduBridge Pilot School",
    slug: "edubridge-pilot-bridge",
    officialEmailDomain: "pilot-school.edu",
  },
  {
    name: "Oakwood Academy",
    slug: "oakwood-academy-bridge",
    officialEmailDomain: "oakwood.edu",
  },
] as const;

const accounts: Account[] = [
  // Pilot school
  {
    uuid: "a1111111-1111-4111-8111-111111111111",
    email: "admin@pilot-school.edu",
    username: "pilot-admin",
    fullName: "Pilot Admin",
    role: "school_admin",
    schoolSlug: "edubridge-pilot-bridge",
  },
  {
    uuid: "a2222222-2222-4222-8222-222222222222",
    email: "teacher@pilot-school.edu",
    username: "pilot-teacher",
    fullName: "Pilot Teacher",
    role: "teacher",
    schoolSlug: "edubridge-pilot-bridge",
  },
  {
    uuid: "a4444444-4444-4444-8444-444444444444",
    email: "coordinator@pilot-school.edu",
    username: "pilot-coordinator",
    fullName: "Pilot Coordinator",
    role: "coordinator",
    schoolSlug: "edubridge-pilot-bridge",
  },
  {
    uuid: "a5555555-5555-4555-8555-555555555555",
    email: "staff@pilot-school.edu",
    username: "pilot-staff",
    fullName: "Pilot Staff",
    role: "staff",
    schoolSlug: "edubridge-pilot-bridge",
  },
  {
    uuid: "a8888888-8888-4888-8888-888888888888",
    email: "accountant@pilot-school.edu",
    username: "pilot-accountant",
    fullName: "Pilot Accountant",
    role: "accountant",
    schoolSlug: "edubridge-pilot-bridge",
  },
  {
    uuid: "a9999999-9999-4999-9999-999999999999",
    email: "vikram@pilot-school.edu",
    username: "pilot-vikram",
    fullName: "Vikram Sharma",
    role: "teacher",
    schoolSlug: "edubridge-pilot-bridge",
  },
  {
    uuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    email: "meera@pilot-school.edu",
    username: "pilot-meera",
    fullName: "Meera Iyer",
    role: "teacher",
    schoolSlug: "edubridge-pilot-bridge",
  },
  // Oakwood school
  {
    uuid: "a6666666-6666-4666-8666-666666666666",
    email: "admin@oakwood.edu",
    username: "oak-admin",
    fullName: "Oakwood Admin",
    role: "school_admin",
    schoolSlug: "oakwood-academy-bridge",
  },
  {
    uuid: "a7777777-7777-4777-8777-777777777777",
    email: "teacher@oakwood.edu",
    username: "oak-teacher",
    fullName: "Oakwood Teacher",
    role: "teacher",
    schoolSlug: "oakwood-academy-bridge",
  },
  // Platform owner
  {
    uuid: "a3333333-3333-4333-8333-333333333333",
    email: "owner@edubridge.app",
    username: "platform-owner",
    fullName: "Platform Owner",
    role: null,
    schoolSlug: null,
    isPlatformOwner: true,
  },
];

// ---------------------------------------------------------------------------
// Deterministic student generator (Indian context, no photos).
// ---------------------------------------------------------------------------

const maleFirstNames = [
  "Aarav", "Vihaan", "Aditya", "Advik", "Kabir", "Reyansh", "Arjun", "Sai",
  "Vivaan", "Atharv", "Ayaan", "Krishna", "Rudra", "Ishaan", "Shaurya",
  "Dhruv", "Kartik", "Rohan", "Rahul", "Amit",
];
const femaleFirstNames = [
  "Ananya", "Diya", "Aadhya", "Myra", "Saanvi", "Ira", "Kiara", "Anika",
  "Navya", "Sara", "Pari", "Advika", "Aarohi", "Tara", "Meera", "Radhika",
  "Kavya", "Ishita", "Nithya", "Divya",
];
const firstNames = [...maleFirstNames, ...femaleFirstNames];
const surnames = [
  "Sharma", "Verma", "Gupta", "Iyer", "Patel", "Reddy", "Nair", "Singh",
  "Kumar", "Das", "Bose", "Chopra", "Mehta", "Joshi", "Rao", "Menon",
  "Pillai", "Bhatt", "Kulkarni", "Desai",
];
const guardianFirstNames = [
  "Rajesh", "Sunita", "Amit", "Priya", "Vikas", "Anita", "Sanjay", "Kavita",
  "Ravi", "Lakshmi", "Deepak", "Sneha", "Manoj", "Rekha", "Ashok", "Vandana",
];
const classLabels = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
/** Class 6 → born ~2013 … Class 10 → born ~2009. */
const classBirthYear: Record<string, number> = {
  "Class 6": 2013,
  "Class 7": 2012,
  "Class 8": 2011,
  "Class 9": 2010,
  "Class 10": 2009,
};

type StudentSeed = {
  admissionNumber: string;
  fullName: string;
  dateOfBirth: string;
  classLabel: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
};

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function buildStudents(
  count: number,
  admissionPrefix: string,
  indexOffset = 0,
): StudentSeed[] {
  const out: StudentSeed[] = [];
  for (let i = 0; i < count; i++) {
    const n = i + indexOffset;
    const first = firstNames[n % firstNames.length] ?? "Student";
    const surname = surnames[(n * 7) % surnames.length] ?? "Sharma";
    const classLabel = classLabels[n % classLabels.length] ?? "Class 6";
    const birthYear = classBirthYear[classLabel] ?? 2013;
    const month = (n % 12) + 1;
    const day = (n % 28) + 1;

    const guardianFirst =
      guardianFirstNames[n % guardianFirstNames.length] ?? "Rajesh";
    const isMother = n % 2 === 1;
    const guardianName = `${isMother ? "Mrs." : "Mr."} ${guardianFirst} ${surname}`;
    const phone = `+91 98${pad((10000000 + n * 1373) % 100000000, 8)}`;
    const email = `${guardianFirst.toLowerCase()}.${surname.toLowerCase()}${n}@gmail.com`;

    out.push({
      admissionNumber: `${admissionPrefix}-${pad(i + 1, 3)}`,
      fullName: `${first} ${surname}`,
      dateOfBirth: `${birthYear}-${pad(month, 2)}-${pad(day, 2)}`,
      classLabel,
      guardianName,
      guardianRelationship: isMother ? "Mother" : "Father",
      guardianPhone: phone,
      guardianEmail: email,
    });
  }
  return out;
}

const pilotStudents = buildStudents(50, "EBS-2024");
const oakwoodStudents = buildStudents(15, "OAK-2024", 5);

async function seedAcademic(
  database: ReturnType<typeof getDb>,
  roster: Array<{ schoolId: string; studentId: string; classLabel: string }>,
  ids: {
    pilotTeacherId: string;
    pilotStaffId: string;
    oakTeacherId: string;
    pilotSchoolId: string | undefined;
    oakwoodSchoolId: string | undefined;
  },
): Promise<void> {
  const schoolIds = [...new Set(roster.map((row) => row.schoolId))];

  for (const schoolId of schoolIds) {
    const labels = [
      ...new Set(
        roster
          .filter((row) => row.schoolId === schoolId)
          .map((row) => row.classLabel),
      ),
    ];

    const classByLabel = new Map<string, string>();
    for (const name of labels) {
      const inserted = await database
        .insert(classes)
        .values({
          schoolId,
          name,
          section: "A",
          academicYear: ACADEMIC_YEAR,
        })
        .onConflictDoUpdate({
          target: [
            classes.schoolId,
            classes.academicYear,
            classes.name,
            classes.section,
          ],
          set: { updatedAt: new Date() },
        })
        .returning({ id: classes.id, name: classes.name });
      const row = inserted[0];
      if (row) classByLabel.set(row.name, row.id);
    }

    const subjectIds: string[] = [];
    for (const name of SEED_SUBJECTS) {
      const inserted = await database
        .insert(subjects)
        .values({ schoolId, name })
        .onConflictDoUpdate({
          target: [subjects.schoolId, subjects.name],
          set: { name },
        })
        .returning({ id: subjects.id });
      if (inserted[0]) subjectIds.push(inserted[0].id);
    }

    const offeringIdsByClass = new Map<string, string[]>();
    for (const classId of classByLabel.values()) {
      const offeringIds: string[] = [];
      for (const subjectId of subjectIds) {
        const inserted = await database
          .insert(classSubjects)
          .values({ schoolId, classId, subjectId })
          .onConflictDoNothing()
          .returning({ id: classSubjects.id });
        if (inserted[0]) {
          offeringIds.push(inserted[0].id);
        } else {
          const existing = await database
            .select({ id: classSubjects.id })
            .from(classSubjects)
            .where(
              and(
                eq(classSubjects.schoolId, schoolId),
                eq(classSubjects.classId, classId),
                eq(classSubjects.subjectId, subjectId),
              ),
            )
            .limit(1);
          if (existing[0]) offeringIds.push(existing[0].id);
        }
      }
      offeringIdsByClass.set(classId, offeringIds);
    }

    for (const pupil of roster.filter((row) => row.schoolId === schoolId)) {
      const classId = classByLabel.get(pupil.classLabel);
      if (!classId) continue;
      await database
        .insert(classEnrollments)
        .values({ schoolId, classId, studentId: pupil.studentId })
        .onConflictDoNothing();
    }

    const class6 = classByLabel.get("Class 6");
    const class7 = classByLabel.get("Class 7");

    if (schoolId === ids.pilotSchoolId && class6) {
      for (const offeringId of offeringIdsByClass.get(class6) ?? []) {
        await database
          .insert(teacherAssignments)
          .values({
            schoolId,
            classSubjectId: offeringId,
            teacherUserId: ids.pilotTeacherId,
          })
          .onConflictDoNothing();
      }
    }
    if (schoolId === ids.pilotSchoolId && class7) {
      await database
        .insert(classStaffDelegations)
        .values({
          schoolId,
          classId: class7,
          userId: ids.pilotStaffId,
        })
        .onConflictDoNothing();
    }
    if (schoolId === ids.oakwoodSchoolId) {
      const firstClassId = classByLabel.values().next().value;
      if (firstClassId) {
        for (const offeringId of offeringIdsByClass.get(firstClassId) ?? []) {
          await database
            .insert(teacherAssignments)
            .values({
              schoolId,
              classSubjectId: offeringId,
              teacherUserId: ids.oakTeacherId,
            })
            .onConflictDoNothing();
        }
      }
    }
  }
}

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed is blocked in NODE_ENV=production.");
  }

  const database = getDb();

  // 1. Upsert schools
  for (const school of schoolRecords) {
    await database
      .insert(schools)
      .values({
        name: school.name,
        slug: school.slug,
        officialEmailDomain: school.officialEmailDomain,
      })
      .onConflictDoUpdate({
        target: schools.slug,
        set: {
          name: school.name,
          officialEmailDomain: school.officialEmailDomain,
          updatedAt: new Date(),
        },
      });
  }

  // 2. Upsert auth users + profiles + memberships
  const schoolRows = await database.select().from(schools);

  for (const account of accounts) {
    const appMeta = account.isPlatformOwner
      ? JSON.stringify({
          platform_owner: true,
          provider: "email",
          providers: ["email"],
        })
      : JSON.stringify({ provider: "email", providers: ["email"] });

    // auth.users (raw SQL — Drizzle doesn't manage Supabase's auth schema)
    // instance_id must be GoTrue's default UUID (all-zero), not NULL: GoTrue
    // scopes password lookups by instance_id and ignores rows with NULL.
    // confirmation_token/recovery_token/email_change/email_change_token_new must
    // be empty strings (not NULL) — GoTrue rejects sign-in on rows with NULLs.
    await database.execute(sql`
      INSERT INTO auth.users (
        instance_id, id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change, email_change_token_new
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        ${account.uuid}::uuid,
        ${account.email},
        crypt(${PASSWORD}, gen_salt('bf', 10)),
        now(), now(), now(),
        'authenticated', 'authenticated',
        ${appMeta}::jsonb,
        '{}'::jsonb,
        '', '', '', ''
      )
      ON CONFLICT (id) DO UPDATE SET
        instance_id = EXCLUDED.instance_id,
        email = EXCLUDED.email,
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = now(),
        updated_at = now(),
        raw_app_meta_data = EXCLUDED.raw_app_meta_data,
        confirmation_token = '',
        recovery_token = '',
        email_change = '',
        email_change_token_new = ''
    `);

    // auth.identities — GoTrue requires an identity row for password sign-in.
    // A user without one fails with "Invalid login credentials" even though the
    // directory renders them (and login-as still works via the admin session).
    await database.execute(sql`
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      )
      VALUES (
        ${account.uuid}::uuid,
        ${account.uuid}::text,
        ${account.uuid}::uuid,
        jsonb_build_object('sub', ${account.uuid}::text, 'email', ${account.email}::text),
        'email',
        null, now(), now()
      )
      ON CONFLICT (provider_id, provider) DO UPDATE SET
        identity_data = EXCLUDED.identity_data,
        updated_at = now()
    `);

    // profiles
    await database
      .insert(profiles)
      .values({
        id: account.uuid,
        fullName: account.fullName,
        email: account.email,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          fullName: account.fullName,
          email: account.email,
          updatedAt: new Date(),
        },
      });

    // school_members (skip platform owner)
    if (account.role && account.schoolSlug) {
      const school = schoolRows.find((s) => s.slug === account.schoolSlug);
      if (!school) continue;

      await database
        .insert(schoolMembers)
        .values({
          schoolId: school.id,
          userId: account.uuid,
          role: account.role as never,
          isActive: true,
          username: account.username,
        })
        .onConflictDoUpdate({
          target: [schoolMembers.schoolId, schoolMembers.userId],
          set: {
            role: account.role as never,
            isActive: true,
            username: account.username,
            updatedAt: new Date(),
          },
        });
    }
  }

  // 3. Students + guardians (dev seed: guardians reset per school, students upserted)
  const pilotSchool = schoolRows.find((s) => s.slug === "edubridge-pilot-bridge");
  const oakwoodSchool = schoolRows.find((s) => s.slug === "oakwood-academy-bridge");
  const pilotAdminId = accounts[0]?.uuid;

  const studentBatches: Array<{
    schoolId: string | undefined;
    batch: StudentSeed[];
  }> = [
    { schoolId: pilotSchool?.id, batch: pilotStudents },
    { schoolId: oakwoodSchool?.id, batch: oakwoodStudents },
  ];

  const seededRoster: Array<{
    schoolId: string;
    studentId: string;
    classLabel: string;
  }> = [];

  for (const { schoolId, batch } of studentBatches) {
    if (!schoolId || batch.length === 0) continue;

    // Reset guardians for this school so the seed stays idempotent.
    await database.execute(
      sql`DELETE FROM student_guardians WHERE school_id = ${schoolId}::uuid`,
    );

    for (const student of batch) {
      const inserted = await database
        .insert(students)
        .values({
          schoolId,
          admissionNumber: student.admissionNumber,
          fullName: student.fullName,
          dateOfBirth: student.dateOfBirth,
          classLabel: student.classLabel,
          createdBy: pilotAdminId,
        })
        .onConflictDoUpdate({
          target: [students.schoolId, students.admissionNumber],
          set: {
            fullName: student.fullName,
            dateOfBirth: student.dateOfBirth,
            classLabel: student.classLabel,
            updatedAt: new Date(),
          },
        })
        .returning({ id: students.id });

      const studentId = inserted[0]?.id;
      if (!studentId) continue;

      seededRoster.push({
        schoolId,
        studentId,
        classLabel: student.classLabel,
      });

      await database.insert(studentGuardians).values({
        schoolId,
        studentId,
        fullName: student.guardianName,
        relationship: student.guardianRelationship,
        phone: student.guardianPhone,
        email: student.guardianEmail,
        isPrimary: true,
      });
    }
  }

  await seedAcademic(database, seededRoster, {
    pilotTeacherId: "a2222222-2222-4222-8222-222222222222",
    pilotStaffId: "a5555555-5555-4555-8555-555555555555",
    oakTeacherId: "a7777777-7777-4777-8777-777777777777",
    pilotSchoolId: pilotSchool?.id,
    oakwoodSchoolId: oakwoodSchool?.id,
  });

  // 4. Verify every seeded auth user has an identity and a non-null
  //    instance_id (GoTrue requires both for password sign-in). Fails the seed
  //    loudly instead of leaving accounts that render but cannot sign in.
  const authUsers = await database.execute(
    sql`select id, email, instance_id from auth.users order by email`,
  );
  const identities = await database.execute(
    sql`select user_id from auth.identities`,
  );
  const userIds = new Set(
    identities.map((row) => String((row as { user_id: string }).user_id)),
  );
  const missingIdentity = authUsers.filter(
    (row) => !userIds.has(String((row as { id: string }).id)),
  );
  if (missingIdentity.length > 0) {
    const emails = missingIdentity
      .map((row) => (row as { email: string }).email)
      .join(", ");
    throw new Error(
      `Seed invariant failed: auth.users without an auth.identities row: ${emails}`,
    );
  }
  const missingInstance = authUsers.filter(
    (row) => (row as { instance_id: string | null }).instance_id == null,
  );
  if (missingInstance.length > 0) {
    const emails = missingInstance
      .map((row) => (row as { email: string }).email)
      .join(", ");
    throw new Error(
      `Seed invariant failed: auth.users with NULL instance_id: ${emails}`,
    );
  }
}

try {
  await seed();
  const studentTotal = pilotStudents.length + oakwoodStudents.length;
  process.stdout.write(
    `Seeded ${schoolRecords.length} schools, ${accounts.length} accounts, ${studentTotal} students (${pilotStudents.length} pilot + ${oakwoodStudents.length} oakwood)\n`,
  );
} finally {
  await closeDb();
}
