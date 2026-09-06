"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { BlackholeHero } from "./hero/blackhole-hero";
import { MarketingModuleCards } from "./marketing-module-cards";
import { MarketingSecurityReveal } from "./marketing-security-reveal";
import { Reveal } from "./marketing-motion";

/**
 * Public homepage. Blackhole hero up top; module bento, security band,
 * shell anatomy, and CTA follow. Footer is composed by the route.
 */
function MarketingHomeContent() {
  return (
    <div className="relative min-h-dvh bg-background">
      <BlackholeHero />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-28 sm:px-6">

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
              Each one orbits the same fence. Open a card to read the product
              note. Surfaces ship phase by phase under one shell, from
              dashboard to fees and receipts.
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
              Register with your official school email and open a workspace in
              minutes, or sign in if you already have one.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 cursor-pointer px-6 text-base active:scale-[0.98]"
              >
                <Link href="/register">Register your school</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer px-6 text-base active:scale-[0.98]"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </section>
        </Reveal>
      </main>
    </div>
  );
}

export function MarketingHome() {
  return <MarketingHomeContent />;
}
