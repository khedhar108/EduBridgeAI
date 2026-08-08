import Link from "next/link";
import { and, eq, getDb, invitations, isNull, schools } from "@repo/db";
import { AcceptInviteForm } from "@/features/auth";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return <InviteError message="This invitation link is invalid." />;
  }

  const db = getDb();
  const rows = await db
    .select({
      email: invitations.email,
      role: invitations.role,
      expiresAt: invitations.expiresAt,
      schoolName: schools.name,
    })
    .from(invitations)
    .innerJoin(schools, eq(invitations.schoolId, schools.id))
    .where(and(eq(invitations.token, token), isNull(invitations.acceptedAt)))
    .limit(1);

  const invite = rows[0];
  if (!invite) {
    return (
      <InviteError message="This invitation is invalid or already used." />
    );
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return (
      <InviteError message="This invitation has expired. Ask your school admin for a new one." />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div className="flex flex-col gap-2">
        <p className="font-serif text-3xl tracking-tight">EduBridge</p>
        <h1 className="text-xl font-semibold">Accept invitation</h1>
      </div>
      <AcceptInviteForm
        token={token}
        email={invite.email}
        schoolName={invite.schoolName}
        role={invite.role}
      />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4 py-16">
      <p className="font-serif text-3xl tracking-tight">EduBridge</p>
      <p className="text-sm text-destructive" role="alert">
        {message}
      </p>
      <Link
        href="/sign-in"
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to sign-in
      </Link>
    </main>
  );
}
