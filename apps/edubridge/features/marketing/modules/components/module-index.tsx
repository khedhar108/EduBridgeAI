"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import { ParticleScrollLazy } from "../../components/particle-scroll-lazy";
import { HeroEntrance } from "../../components/marketing-motion";
import { MODULE_TINT_CLASSES, getModuleTint } from "../../components/module-tints";
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
            const tint = getModuleTint(page.slug);
            return (
              <li key={page.slug}>
                <Link
                  href={`/modules/${page.slug}`}
                  className={cn(
                    "group relative flex h-full cursor-pointer flex-col gap-4 overflow-hidden rounded-xl border border-border p-5 transition-colors hover:border-current/30 sm:p-6",
                    MODULE_TINT_CLASSES[tint],
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-current opacity-10 blur-2xl"
                  />
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-lg bg-background/70 text-current shadow-[0_1px_0_oklch(0_0_0/0.04)]">
                    <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                  </span>
                  <span className="relative z-10 flex flex-col gap-2">
                    <span className="font-serif text-xl tracking-tight text-current">
                      {page.title}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/75">
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
