import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export function MarketingHome() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.92_0.04_195),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,oklch(0.9_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0_0)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <p className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
          EduBridge
        </p>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" asChild className="h-11 px-3">
            <Link href="/platform/sign-in">Platform</Link>
          </Button>
          <Button asChild className="h-11 px-5">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-6xl flex-col justify-center gap-10 px-4 pb-20 sm:px-6">
        <div className="flex max-w-2xl flex-col gap-6">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            School operations,
            <span className="block text-primary">quietly modern.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Isolated workspaces for every school. Role-aware access for admins,
            teachers, staff, students, and parents — with AI that stays inside
            your tenant boundary.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/sign-in">School workspace sign-in</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
            >
              <Link href="/platform/sign-in">Platform owner</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            New schools join by invitation or guided onboarding — not open
            self-serve signup yet.
          </p>
        </div>
      </main>
    </div>
  );
}
