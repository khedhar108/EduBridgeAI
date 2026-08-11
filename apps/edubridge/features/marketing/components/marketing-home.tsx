"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { BrandMarkPreview } from "./canvasui/brand-mark-preview";
import { MarketingModuleCards } from "./marketing-module-cards";
import { MarketingSecurityReveal } from "./marketing-security-reveal";
import { HeroEntrance, Reveal } from "./marketing-motion";

/**
 * Public homepage. Document scroll + Framer Motion reveals.
 * Hero keeps particle-object (no browser flag). Canvas UI scroll/decrypt not used here.
 */
function MarketingHomeContent() {
  return (
    <div className="relative min-h-dvh bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.92_0.04_195),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(to_right,oklch(0.9_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0_0)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]"
      />

      <header className="relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <p className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
          EduBridge
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="/modules"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Modules
          </Link>
          <Button asChild className="h-10 cursor-pointer px-5 active:scale-[0.98]">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-28 sm:px-6">
        <section className="flex min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:gap-14">
          <div className="flex max-w-xl flex-1 flex-col justify-center gap-6">
            <HeroEntrance>
              <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                The AI-enabled school ERP that stays inside your fence.
              </h1>
            </HeroEntrance>
            <HeroEntrance delay={0.08}>
              <p className="max-w-[36ch] text-lg leading-relaxed text-muted-foreground">
                Isolated workspaces, role-aware modules, and AI that drafts while
                humans approve.
              </p>
            </HeroEntrance>
            <HeroEntrance delay={0.14}>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="h-12 cursor-pointer px-6 text-base active:scale-[0.98]"
                >
                  <Link href="/sign-in">Enter workspace</Link>
                </Button>
                <Link
                  href="/modules"
                  className="cursor-pointer text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Explore modules
                </Link>
              </div>
            </HeroEntrance>
          </div>

          <HeroEntrance
            delay={0.18}
            className="pointer-events-auto relative hidden aspect-square w-full max-w-md flex-1 lg:block"
          >
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" aria-hidden />
            <BrandMarkPreview />
          </HeroEntrance>
        </section>

        <section
          className="flex flex-col gap-12 py-28 sm:py-32"
          aria-labelledby="modules-heading"
        >
          <Reveal className="flex max-w-xl flex-col gap-3">
            <h2
              id="modules-heading"
              className="font-serif text-3xl tracking-tight sm:text-4xl"
            >
              Modules built for how schools actually run
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Open a card to read the product note. Surfaces ship phase by
              phase under one shell, from dashboard to fees and receipts.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <MarketingModuleCards />
          </Reveal>
        </section>

        <MarketingSecurityReveal />

        <Reveal>
          <section
            className="grid gap-8 border-y border-border py-20 sm:grid-cols-[1.1fr_0.9fr] sm:gap-12 sm:py-24"
            aria-labelledby="shell-heading"
          >
            <div className="flex flex-col gap-4">
              <h2
                id="shell-heading"
                className="font-serif text-2xl tracking-tight sm:text-3xl"
              >
                One shell. Every role.
              </h2>
              <p className="max-w-md leading-relaxed text-muted-foreground">
                After sign-in the header stays familiar: menu, active module,
                search, profile. What opens depends on role. Teachers get
                teaching tools. Admins get team and settings. Parents and
                students see only their slice.
              </p>
            </div>
            <ul className="flex flex-col justify-center gap-4 text-sm text-muted-foreground">
              <li className="border-l-2 border-primary/40 pl-4">
                Role-filtered application menu
              </li>
              <li className="border-l-2 border-primary/40 pl-4">
                Active module pill for orientation
              </li>
              <li className="border-l-2 border-primary/40 pl-4">
                Server-side blocks on forbidden routes
              </li>
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="flex flex-col items-start gap-5 py-28 sm:py-32">
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
              Ready when your school is.
            </h2>
            <p className="max-w-md text-muted-foreground leading-relaxed">
              Sign in to an invited workspace, or open the platform console if
              you operate EduBridge.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 cursor-pointer px-6 text-base active:scale-[0.98]"
            >
              <Link href="/sign-in">Enter workspace</Link>
            </Button>
          </section>
        </Reveal>
      </main>

      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span>EduBridge</span>
          <div className="flex items-center gap-4">
            <Link
              href="/modules"
              className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline"
            >
              Modules
            </Link>
            <Link
              href="/platform/sign-in"
              className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline"
            >
              Platform
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function MarketingHome() {
  return <MarketingHomeContent />;
}
