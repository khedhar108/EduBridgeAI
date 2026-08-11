"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { ParticleScrollLazy } from "../../components/particle-scroll-lazy";
import { HeroEntrance } from "../../components/marketing-motion";
import { listModulePages } from "../content";
import { getModuleIcon } from "../lib/icons";

function ModuleIndexContent() {
  const pages = listModulePages();

  return (
    <div className="relative min-h-full bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,oklch(0.92_0.04_195),transparent)]"
      />

      <header className="relative z-10 mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-foreground sm:text-2xl"
        >
          EduBridge
        </Link>
        <Button asChild className="h-10 cursor-pointer px-5 active:scale-[0.98]">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-28 pt-10 sm:px-6">
        <header className="flex max-w-xl flex-col gap-4">
          <HeroEntrance>
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" aria-hidden />
              EduBridge
            </Link>
          </HeroEntrance>
          <HeroEntrance delay={0.06}>
            <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
              Modules
            </h1>
          </HeroEntrance>
          <HeroEntrance delay={0.1}>
            <p className="leading-relaxed text-muted-foreground">
              Short product overviews for schools. Open a module to see what
              EduBridge provides; image slots are ready when assets land.
            </p>
          </HeroEntrance>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {pages.map((page) => {
            const Icon = getModuleIcon(page.icon);
            return (
              <li key={page.slug}>
                <Link
                  href={`/modules/${page.slug}`}
                  className="group flex h-full cursor-pointer flex-col gap-4 rounded-xl border border-border bg-muted/40 p-5 transition-colors hover:bg-muted sm:p-6"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-background text-primary shadow-[0_1px_0_oklch(0_0_0/0.04)]">
                    <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                  </span>
                  <span className="flex flex-col gap-2">
                    <span className="font-serif text-xl tracking-tight text-foreground group-hover:text-primary">
                      {page.title}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {page.tagline}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

/** Index of all marketing module showcases. */
export function ModuleIndex() {
  return (
    <div className="h-dvh overflow-hidden bg-background">
      <ParticleScrollLazy>
        <ModuleIndexContent />
      </ParticleScrollLazy>
    </div>
  );
}
