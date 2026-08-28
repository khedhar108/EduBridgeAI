import Link from "next/link";

/**
 * Friendly "your account is disabled" screen — shown instead of a bare 404
 * when an authenticated user is an inactive or archived member of the
 * workspace. RLS is still the backstop; this is the human-facing explanation.
 */
export function AccountDisabledScreen({
  schoolName,
  archived = false,
}: {
  schoolName?: string;
  archived?: boolean;
}) {
  const place = schoolName ? ` ${schoolName}` : " this workspace";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-medium text-muted-foreground">
        {archived ? "Account archived" : "Account disabled"}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {archived
          ? `Your access to${place} has been removed`
          : `Your access to${place} is disabled`}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {archived
          ? "An administrator archived this account. Access cannot be restored from the usual activate control. Contact your school admin if you believe this is a mistake."
          : "An administrator has disabled this account. If you believe this is a mistake, contact your school admin to re-enable your access."}
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
