import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { listMembershipsForUser } from "@/lib/tenancy/session-context";
import { AuthHeader } from "@/features/auth";

export default async function ChooseWorkspacePage() {
  const user = await requireUser();
  if (!user) redirect("/sign-in");

  const memberships = await listMembershipsForUser(user.id);
  if (memberships.length === 0) redirect("/awaiting-invitation");
  if (memberships.length === 1) {
    redirect(`/${memberships[0]!.schoolSlug}`);
  }

  return (
    <>
      <AuthHeader
        title="Choose workspace"
        description="You belong to more than one school. Pick the workspace to open."
      />
      <ul className="flex w-full flex-col gap-2">
        {memberships.map((m) => (
          <li key={m.schoolId}>
            <Link
              href={`/${m.schoolSlug}`}
              className="flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              {m.schoolName}
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                {m.role.replace("_", " ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
