import Link from "next/link";

/**
 * Friendly "your account is disabled" screen — shown instead of a bare 404
 * when an authenticated user is an inactive member of the workspace. RLS is
 * still the backstop; this is the human-facing explanation.
 */
export function AccountDisabledScreen({ schoolName }: { schoolName?: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-medium text-muted-foreground">
        Account disabled
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Your access to{schoolName ? ` ${schoolName}` : " this workspace"} is
        disabled
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        An administrator has disabled this account. If you believe this is a
        mistake, contact your school admin to re-enable your access.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </main>
  );
}
