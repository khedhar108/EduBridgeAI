import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { requireUser } from "@/lib/auth/get-user";
import { listPendingRequestsForUser } from "@/lib/tenancy/domain-join";
import { listMembershipsForUser } from "@/lib/tenancy/session-context";
import { signOutAction } from "@/features/auth";

export default async function AwaitingInvitationPage() {
  const user = await requireUser();
  if (!user) redirect("/sign-in");

  const memberships = await listMembershipsForUser(user.id);
  if (memberships.length === 1) {
    redirect(`/${memberships[0]!.schoolSlug}`);
  }
  if (memberships.length > 1) {
    redirect("/choose-workspace");
  }

  const pending = await listPendingRequestsForUser(user.id);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {pending.length > 0 ? "Awaiting activation" : "Awaiting invitation"}
      </h1>

      {pending.length > 0 ? (
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Signed in as {user.email}. Your school email matched{" "}
            <span className="font-medium text-foreground">
              {pending.map((p) => p.schoolName).join(", ")}
            </span>
            .
          </p>
          <p>
            A school admin must activate you from the team dashboard before you
            can open the workspace. Role is assigned when they activate — not
            when you sign up.
          </p>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Signed in as {user.email}, but no school membership yet. Ask your
          school admin for an invite link, or register with your official school
          email if the school domain is already set up.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="h-11">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href="/join-school">School email sign-up</Link>
        </Button>
        <form action={signOutAction}>
          <Button type="submit" className="h-11">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
