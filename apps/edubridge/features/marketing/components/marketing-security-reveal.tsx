"use client";

import {
  BotIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./marketing-motion";
import { PLATFORM_NAME } from "@/lib/brand";

const SECURITY_PILLARS = [
  {
    title: "One school, one fence",
    body: "Every tenant has its own workspace and school_id. Student records, fees, and reports never leak across schools.",
    Icon: ShieldCheckIcon,
  },
  {
    title: "Roles decide visibility",
    body: "Admins, teachers, staff, parents, and students only see what their role allows. Forbidden modules stay hidden and blocked server-side.",
    Icon: UsersIcon,
  },
  {
    title: "RLS on every read and write",
    body: "Postgres row-level security is the backstop. App checks assert the session; the database still refuses cross-tenant queries.",
    Icon: KeyRoundIcon,
  },
  {
    title: "AI drafts, humans approve",
    body: "Assistants run with scoped tokens inside the fence. They never write tenant data on their own. Staff still sign off.",
    Icon: BotIcon,
  },
] as const;

/**
 * Homepage security band for school buyers.
 * Framer Motion scroll reveal — no Canvas UI / browser flag required.
 */
export function MarketingSecurityReveal() {
  return (
    <section
      className="flex flex-col gap-10 py-28 sm:py-32"
      aria-labelledby="security-heading"
    >
      <Reveal className="flex max-w-2xl flex-col gap-3">
        <h2
          id="security-heading"
          className="font-serif text-3xl tracking-tight sm:text-4xl"
        >
          Your school data stays inside the fence
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Isolation, roles, and human-approved AI share one security boundary
          built for schools — not demos that need a special browser flag.
        </p>
      </Reveal>

      <div className="rounded-xl border border-border bg-muted/30 p-5 sm:p-8">
        <Reveal delay={0.04} className="mb-8 flex max-w-3xl flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
            Security for schools
          </p>
          <h3 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem] lg:leading-[1.15]">
            Clear only where your role belongs.
          </h3>
          <p className="max-w-[58ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {PLATFORM_NAME} is multi-tenant by design. Fees, attendance, report
            cards, and parent views live in your school workspace. Platform
            operators do not browse another school&apos;s rows from product
            screens.
          </p>
        </Reveal>

        <Stagger className="grid gap-5 sm:grid-cols-2">
          {SECURITY_PILLARS.map(({ title, body, Icon }) => (
            <StaggerItem key={title}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border/80 bg-background/90 p-5 sm:p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                </span>
                <h4 className="text-base font-semibold text-foreground">
                  {title}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.08}>
          <p className="mt-8 border-t border-border/70 pt-6 text-sm leading-relaxed text-muted-foreground">
            Session from your school. Role on every action. Database policies
            as the last line. That is the fence.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
