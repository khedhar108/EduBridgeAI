import Link from "next/link";
import { and, eq, getDb, invitations, isNull, schools } from "@repo/db";
import { AcceptInviteForm, AuthHeader } from "@/features/auth";

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
    <>
      <AuthHeader title="Accept invitation" />
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
    </>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <>
      <AuthHeader title="Invitation problem" />
      <p className="text-sm text-destructive" role="alert">
        {message}
      </p>
      <Link
        href="/sign-in"
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to sign-in
      </Link>
    </>
  );
}
