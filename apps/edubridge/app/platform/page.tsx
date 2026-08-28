import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { getPlatformContext } from "@/lib/access/platform-context";
import { listSchoolsOverview } from "@/lib/access/platform-overview";
import { signOutAction } from "@/features/auth";

export default async function PlatformHomePage() {
  const ctx = await getPlatformContext();
  if (!ctx) {
    redirect("/platform/sign-in?next=/platform");
  }

  const schools = await listSchoolsOverview();
  const totalMembers = schools.reduce((s, x) => s + x.activeMemberCount, 0);
  const totalStudents = schools.reduce((s, x) => s + x.studentCount, 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Platform</p>
          <h1 className="text-3xl font-semibold tracking-tight">Console</h1>
          <p className="text-sm text-muted-foreground">{ctx.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="h-11">
            Sign out
          </Button>
        </form>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Schools" value={String(schools.length)} />
        <Stat label="Active members" value={String(totalMembers)} />
        <Stat label="Students" value={String(totalStudents)} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Schools</h2>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">School</th>
                <th className="px-4 py-2 font-medium">Domain</th>
                <th className="px-4 py-2 font-medium">Members</th>
                <th className="px-4 py-2 font-medium">Students</th>
                <th className="px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schools.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      /{s.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.officialEmailDomain}
                  </td>
                  <td className="px-4 py-3">{s.activeMemberCount}</td>
                  <td className="px-4 py-3">{s.studentCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.createdAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No schools yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2 border-t border-border pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Billing, funnel analytics, and module toggles land in Phase 6.
          Tenant school data stays behind membership or a support grant —
          never silent access from this console.
        </p>
        <Button asChild variant="ghost" className="h-11 w-fit px-0">
          <Link href="/">Back to home</Link>
        </Button>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
