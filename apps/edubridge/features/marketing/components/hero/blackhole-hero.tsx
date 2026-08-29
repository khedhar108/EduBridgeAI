"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { HeroEntrance } from "../marketing-motion";
import { BlackholeCore } from "./blackhole-core";
import { ModuleOrbit } from "./module-orbit";
import { DropOfEducation } from "./drop-of-education";
import { PLATFORM_NAME } from "@/lib/brand";

/**
 * Marketing hero: a gravitational well pulls every module into one orbit;
 * the Drop of Education emerges at the bottom. One-component home swap.
 */
export function BlackholeHero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-background">
      {/* section-level ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-12%,oklch(0.92_0.04_195),transparent_70%)]"
      />

      <header className="relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <p className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
          {PLATFORM_NAME}
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="/modules"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Modules
          </Link>
          <Link
            href="/sign-in"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Button asChild className="h-10 cursor-pointer px-5 active:scale-[0.98]">
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-4 py-8 sm:px-6 lg:gap-14 lg:py-10">
        <div className="grid w-full flex-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* asymmetric voice column */}
          <div className="flex max-w-xl flex-1 flex-col justify-center gap-6">
            <HeroEntrance>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                One tenant fence · every role
              </p>
            </HeroEntrance>
            <HeroEntrance delay={0.06}>
              <h1 className="font-serif text-4xl leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Every module a school runs, pulled into one orbit.
              </h1>
            </HeroEntrance>
            <HeroEntrance delay={0.12}>
              <p className="max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
                Dashboard, fees, receipts, timetables, report cards, exams, and
                AI that drafts while humans approve — circling one tenant fence,
                one role-aware shell.
              </p>
            </HeroEntrance>
            <HeroEntrance delay={0.18}>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="h-12 cursor-pointer px-6 text-base active:scale-[0.98]"
                >
                  <Link href="/register">Register your school</Link>
                </Button>
                <Link
                  href="/sign-in"
                  className="cursor-pointer text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </HeroEntrance>
          </div>

          {/* orbit stage over the well — the drop sits at the singularity
              center, modules orbit around it */}
          <div className="relative hidden aspect-square w-full max-w-[78vmin] justify-self-center lg:block">
            <BlackholeCore className="absolute inset-0" />
            <DropOfEducation
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            />
            <ModuleOrbit className="absolute inset-0 m-auto" />
          </div>
        </div>
      </main>
    </section>
  );
}
