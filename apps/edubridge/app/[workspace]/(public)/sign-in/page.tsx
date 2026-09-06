import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AuthHeader,
  AuthShell,
  DemoAccountsModal,
  FamilySignInForm,
  SignInForm,
  WorkspaceHowAreYou,
  getFamilyStudentPreview,
  getPublicSchoolBySlug,
  parseWorkspaceDoorWho,
  workspaceSignInHref,
  workspaceSignInNext,
} from "@/features/auth";
import { requireUser } from "@/lib/auth/get-user";
import { getFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ next?: string; error?: string; who?: string }>;
};

export default async function WorkspaceSignInPage({
  params,
  searchParams,
}: Props) {
  const [{ workspace }, query] = await Promise.all([params, searchParams]);
  const next = workspaceSignInNext(workspace, query.next);
  const who = parseWorkspaceDoorWho(query.who);
  const [school, user] = await Promise.all([
    getPublicSchoolBySlug(workspace),
    requireUser(),
  ]);
  if (!school) notFound();
  if (user) redirect(next);

  if (who === "family") {
    const session = await getFamilySession(workspace);
    if (session) {
      const student = await getFamilyStudentPreview(
        session.schoolId,
        session.activeStudentId,
      );
      if (student && session.studentIds.includes(session.activeStudentId)) {
        redirect(`/${workspace}/family/home`);
      }
    }
  }

  const backHref = workspaceSignInHref(workspace, { next: query.next });

  return (
    <AuthShell>
      {who === "school" ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <AuthHeader
              title={school.name}
              description="Username or email — this school is already selected."
            />
            <DemoAccountsModal />
          </div>
          {query.error === "auth" ? (
            <p className="text-sm text-destructive" role="alert">
              We couldn&apos;t complete that sign-in. Try again.
            </p>
          ) : null}
          <SignInForm surface="school" workspace={workspace} next={next} />
          <p className="text-center text-sm text-muted-foreground">
            New staff with a school email?{" "}
            <Link
              href="/join-school"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Request access
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={backHref}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              How are you?
            </Link>
          </p>
        </>
      ) : who === "family" ? (
        <>
          <AuthHeader
            title={school.name}
            description="Admission number and date of birth. No email or password."
          />
          <FamilySignInForm workspace={workspace} schoolName={school.name} />
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={backHref}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              How are you?
            </Link>
          </p>
        </>
      ) : (
        <WorkspaceHowAreYou
          workspace={workspace}
          schoolName={school.name}
          next={query.next}
        />
      )}
    </AuthShell>
  );
}
