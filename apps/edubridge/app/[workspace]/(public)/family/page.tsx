import { notFound, redirect } from "next/navigation";
import {
  getFamilyStudentPreview,
  getPublicSchoolBySlug,
  workspaceSignInHref,
} from "@/features/auth";
import { getFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyEntryPage({ params }: Props) {
  const { workspace } = await params;
  const school = await getPublicSchoolBySlug(workspace);
  if (!school) notFound();

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

  redirect(workspaceSignInHref(workspace, { who: "family" }));
}
