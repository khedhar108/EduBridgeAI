import Link from "next/link";
import { Droplet } from "lucide-react";

/**
 * Global 404 screen. Server component with CSS-only motion so it paints fast
 * and ships no client JS. The animation is decorative and gated behind
 * `prefers-reduced-motion`.
 */
export function NotFoundScreen() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_35%,var(--accent)/12,transparent)]"
      />

      <div className="not-found-mark text-primary">
        <Droplet className="size-10" strokeWidth={1.5} />
      </div>

      <p className="mt-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Page not found
      </p>

      <h1 className="not-found-code font-serif text-7xl font-semibold tracking-tight text-foreground sm:text-8xl">
        404
      </h1>

      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page you are looking for doesn&apos;t exist, may have moved, or you
        may not have access to it.
      </p>

      <Link
        href="/"
        className="mt-8 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </main>
  );
}
