import { stopImpersonationAction } from "@/features/auth";

type ImpersonationBannerProps = {
  workspace: string;
  targetEmail?: string;
  targetRole: string;
  realEmail?: string;
};

/**
 * Shown above the workspace shell when an admin is impersonating a member.
 * Green-tinted to distinguish from error banners. Exit clears the signed
 * cookie and returns the admin to their own view.
 */
export function ImpersonationBanner({
  workspace,
  targetEmail,
  targetRole,
  realEmail,
}: ImpersonationBannerProps) {
  return (
    <div className="border-b border-emerald-200 bg-emerald-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6">
        <p className="text-emerald-900">
          <span className="font-semibold">Viewing as</span>{" "}
          {targetEmail ?? "another user"}{" "}
          <span className="text-emerald-600">
            ({targetRole.replace(/_/g, " ")})
          </span>
          {" — "}
          signed in as {realEmail ?? "admin"}
        </p>
        <form action={stopImpersonationAction.bind(null, workspace)}>
          <button
            type="submit"
            className="font-medium text-emerald-900 underline underline-offset-2 hover:no-underline"
          >
            Exit
          </button>
        </form>
      </div>
    </div>
  );
}
