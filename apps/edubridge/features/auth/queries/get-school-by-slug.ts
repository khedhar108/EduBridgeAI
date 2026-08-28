import { cache } from "react";
import { eq, getDb, schools } from "@repo/db";

export type PublicSchool = {
  name: string;
  slug: string;
};

/** Privileged lookup — school name is public once the slug is in the URL. */
export const getPublicSchoolBySlug = cache(
  async (slug: string): Promise<PublicSchool | null> => {
    const value = slug.trim().toLowerCase();
    if (!value) return null;

    const db = getDb();
    const rows = await db
      .select({ name: schools.name, slug: schools.slug })
      .from(schools)
      .where(eq(schools.slug, value))
      .limit(1);

    return rows[0] ?? null;
  },
);
