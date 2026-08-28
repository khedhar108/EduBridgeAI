import { Button } from "@repo/ui/components/button";

type ErrorScreenProps = {
  statusCode: number;
  message?: string;
  /** Passed from an error boundary's `reset()` when available. */
  onReset?: () => void;
};

/**
 * Reusable runtime-error screen (status-coded). Used by `app/error.tsx` and
 * `app/global-error.tsx`. Keep presentational so boundaries stay thin.
 */
export function ErrorScreen({ statusCode, message, onReset }: ErrorScreenProps) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_35%,var(--destructive)/8,transparent)]"
      />

      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Something went wrong
      </p>

      <h1 className="font-serif text-7xl font-semibold tracking-tight text-foreground sm:text-8xl">
        {statusCode}
      </h1>

      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {message ?? "An unexpected error occurred. Please try again."}
      </p>

      {onReset ? (
        <Button type="button" onClick={onReset} className="mt-8 h-11">
          Try again
        </Button>
      ) : null}
    </main>
  );
}
