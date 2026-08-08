import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { getPlatformContext } from "@/lib/access/platform-context";
import { signOutAction } from "@/features/auth";

export default async function PlatformHomePage() {
  const ctx = await getPlatformContext();
  if (!ctx) {
    redirect("/platform/sign-in?next=/platform");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-12">
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

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-medium">Phase 0 placeholder</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Auth works. Billing, funnel analytics, and module toggles land in
          Phase 6. Tenant school data stays behind membership or a support
          grant — never silent access from this console.
        </p>
        <Button asChild variant="ghost" className="h-11 w-fit px-0">
          <Link href="/">Back to home</Link>
        </Button>
      </section>
    </main>
  );
}
