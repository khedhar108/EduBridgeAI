"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  readConsentFromDocument,
  writeConsentToDocument,
  type CookieChoice,
} from "@/lib/legal/consent";
import { COOKIE_PREFS_EVENT } from "@/lib/legal/cookie-inventory";
import { COOKIES_PATH } from "@/lib/legal/paths";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readConsentFromDocument();
    if (!stored?.cookies) setOpen(true);

    const onPrefs = () => setOpen(true);
    window.addEventListener(COOKIE_PREFS_EVENT, onPrefs);
    return () => window.removeEventListener(COOKIE_PREFS_EVENT, onPrefs);
  }, []);

  function choose(cookies: CookieChoice) {
    const existing = readConsentFromDocument();
    writeConsentToDocument({
      termsVersion: existing?.termsVersion,
      cookies,
      at: new Date().toISOString(),
    });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_oklch(0_0_0/0.06)] backdrop-blur-md sm:p-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            Cookies on {PLATFORM_NAME}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Necessary cookies run sign-in and this choice. Accept all will also
            cover optional cookies when we add them — none are set today, so both
            buttons currently have the same effect.{" "}
            <Link
              href={COOKIES_PATH}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Cookie policy
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 cursor-pointer"
            onClick={() => choose("necessary")}
          >
            Necessary only
          </Button>
          <Button
            type="button"
            className="h-11 cursor-pointer"
            onClick={() => choose("all")}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
