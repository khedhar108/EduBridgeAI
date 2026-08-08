import { closeDb, getDb } from "./client";
import { schools } from "./schema";

const pilotSchool = {
  name: "EduBridge Pilot School",
  slug: "edubridge-pilot-bridge",
  officialEmailDomain: "pilot-school.edu",
} as const;

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed is blocked in NODE_ENV=production.");
  }

  const database = getDb();

  await database
    .insert(schools)
    .values(pilotSchool)
    .onConflictDoUpdate({
      target: schools.slug,
      set: {
        name: pilotSchool.name,
        officialEmailDomain: pilotSchool.officialEmailDomain,
        updatedAt: new Date(),
      },
    });
}

try {
  await seed();
  process.stdout.write(
    `Seeded pilot school: ${pilotSchool.name} (${pilotSchool.slug})\n`,
  );
} finally {
  await closeDb();
}
