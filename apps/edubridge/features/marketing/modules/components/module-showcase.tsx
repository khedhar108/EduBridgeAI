"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { ParticleScrollLazy } from "../../components/particle-scroll-lazy";
import { HeroEntrance } from "../../components/marketing-motion";
import type { ModulePage } from "../types";
import { listModulePages } from "../content";
import { getModuleIcon } from "../lib/icons";
import { ModuleMediaSlot } from "./module-media-slot";

function ModuleShowcaseContent({ page }: { page: ModulePage }) {
  const Icon = getModuleIcon(page.icon);
  const siblings = listModulePages().filter((p) => p.slug !== page.slug);

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
        <nav className="flex items-center gap-4">
          <Link
            href="/modules"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            All modules
          </Link>
          <Button asChild className="h-10 cursor-pointer px-5 active:scale-[0.98]">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </nav>
      </header>

      <article className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 pb-28 pt-8 sm:px-6 sm:pt-12">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div className="flex flex-col gap-5">
            <HeroEntrance>
              <Link
                href="/modules"
                className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeftIcon className="size-4" aria-hidden />
                All modules
              </Link>
            </HeroEntrance>
            <HeroEntrance delay={0.06}>
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden strokeWidth={1.75} />
              </span>
            </HeroEntrance>
            <HeroEntrance delay={0.1}>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  {page.readingMinutes} min read · {page.audience}
                </p>
                <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {page.title}
                </h1>
                <p className="max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
                  {page.tagline}
                </p>
              </div>
            </HeroEntrance>
            <HeroEntrance delay={0.14}>
              <p className="max-w-[52ch] leading-relaxed text-muted-foreground">
                {page.summary}
              </p>
            </HeroEntrance>
          </div>

          <HeroEntrance delay={0.12}>
            <ModuleMediaSlot {...page.hero} priority />
          </HeroEntrance>
        </div>

        <section
          className="grid gap-4 border-y border-border py-10 sm:grid-cols-3 sm:gap-6"
          aria-label="Highlights"
        >
          {page.highlights.map((item) => (
            <p
              key={item}
              className="border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground"
            >
              {item}
            </p>
          ))}
        </section>

        <div className="flex flex-col gap-20">
          {page.sections.map((section, index) => {
            const mediaFirst = Boolean(section.media) && index % 2 === 1;
            if (!section.media) {
              return (
                <section key={section.heading} className="flex max-w-2xl flex-col gap-3">
                  <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                    {section.heading}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              );
            }
            return (
              <section
                key={section.heading}
                className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12"
              >
                {mediaFirst ? <ModuleMediaSlot {...section.media} /> : null}
                <div className="flex flex-col gap-3">
                  <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                    {section.heading}
                  </h2>
                  <p className="max-w-[55ch] leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </div>
                {!mediaFirst ? <ModuleMediaSlot {...section.media} /> : null}
              </section>
            );
          })}
        </div>

        {siblings.length > 0 ? (
          <section className="flex flex-col gap-6 border-t border-border pt-12" aria-labelledby="more-modules">
            <h2
              id="more-modules"
              className="font-serif text-2xl tracking-tight text-foreground"
            >
              More modules
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {siblings.slice(0, 4).map((sibling) => {
                const SiblingIcon = getModuleIcon(sibling.icon);
                return (
                  <li key={sibling.slug}>
                    <Link
                      href={`/modules/${sibling.slug}`}
                      className="group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                        <SiblingIcon className="size-4" aria-hidden strokeWidth={1.75} />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {sibling.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {sibling.tagline}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-10">
          <Button
            asChild
            size="lg"
            className="h-12 cursor-pointer px-6 active:scale-[0.98]"
          >
            <Link href="/sign-in">Enter workspace</Link>
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
        </footer>
      </article>
    </div>
  );
}

/**
 * Single showcase shell for every marketing module page.
 * Add or edit content under `modules/content/<slug>.ts` — this layout stays shared.
 */
export function ModuleShowcase({ page }: { page: ModulePage }) {
  return (
    <div className="h-dvh overflow-hidden bg-background">
      <ParticleScrollLazy>
        <ModuleShowcaseContent page={page} />
      </ParticleScrollLazy>
    </div>
  );
}
