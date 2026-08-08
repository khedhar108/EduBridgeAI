import { getDb, schools } from "@repo/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type CheckResult =
  | {
      ok: true;
      rows: Array<{ id: string; name: string; slug: string }>;
    }
  | {
      ok: false;
      message: string;
    };

async function checkDatabase(): Promise<CheckResult> {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "DATABASE_URL is not configured in apps/edubridge/.env.local.",
    };
  }

  try {
    const rows = await getDb()
      .select({
        id: schools.id,
        name: schools.name,
        slug: schools.slug,
      })
      .from(schools)
      .orderBy(schools.name)
      .limit(20);

    return { ok: true, rows };
  } catch {
    return {
      ok: false,
      message:
        "Database query failed. Verify the URL, then apply the migration and seed.",
    };
  }
}

export default async function DatabaseCheckPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const result = await checkDatabase();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16 sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
            Development only
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            Database check
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Server-rendered through Drizzle. This route returns 404 in
            production.
          </p>
        </div>

        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p
            className={
              result.ok
                ? "font-semibold text-emerald-700"
                : "font-semibold text-red-700"
            }
          >
            {result.ok ? "Connected" : "Not connected"}
          </p>

          {result.ok ? (
            result.rows.length > 0 ? (
              <ul className="mt-4 divide-y divide-neutral-100">
                {result.rows.map((school) => (
                  <li
                    key={school.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="font-medium text-neutral-900">
                      {school.name}
                    </span>
                    <code className="text-xs text-neutral-500">
                      {school.slug}
                    </code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">
                Connected, but no schools exist. Run <code>pnpm seed:dev</code>.
              </p>
            )
          ) : (
            <p className="mt-3 text-sm text-neutral-600">{result.message}</p>
          )}
        </section>

        <Link
          className="text-sm font-medium text-neutral-700 underline"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
