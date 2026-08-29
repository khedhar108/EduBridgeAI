"use client";

import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/brand";
import { COOKIE_PREFS_EVENT } from "@/lib/legal/cookie-inventory";
import { LEGAL_DOCS_IN_FORCE } from "@/lib/legal/constants";
import { COOKIES_PATH, PRIVACY_PATH, TERMS_PATH } from "@/lib/legal/paths";

const links = [
  { href: "/modules", label: "Modules" },
  { href: TERMS_PATH, label: "Terms" },
  { href: PRIVACY_PATH, label: "Privacy" },
  { href: COOKIES_PATH, label: "Cookies" },
  { href: "/platform/sign-in", label: "Platform" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="font-serif text-sm text-foreground underline-offset-4 hover:underline"
          >
            {PLATFORM_NAME}
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <CookiePrefsButton />
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            © {year} {PLATFORM_NAME}
            {LEGAL_DOCS_IN_FORCE ? null : " · Draft documents — not in force"}
          </p>
        </div>
      </div>
    </footer>
  );
}

function CookiePrefsButton() {
  return (
    <button
      type="button"
      className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline"
      onClick={() => {
        window.dispatchEvent(new Event(COOKIE_PREFS_EVENT));
      }}
    >
      Cookie preferences
    </button>
  );
}
