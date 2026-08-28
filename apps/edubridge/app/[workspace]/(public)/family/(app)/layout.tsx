import { notFound, redirect } from "next/navigation";
import {
  familySignOutAction,
  familySwitchChildAction,
  getFamilyStudentPreview,
  getPublicSchoolBySlug,
  listFamilyStudentPreviews,
} from "@/features/auth";
import { familyModules } from "@/features/shell";
import { FamilyShell } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
};

export default async function FamilyAppLayout({ children, params }: Props) {
  const { workspace } = await params;
  const school = await getPublicSchoolBySlug(workspace);
  if (!school) notFound();

  const session = await requireFamilySession(workspace);
  if (!session.studentIds.includes(session.activeStudentId)) {
    redirect(`/${workspace}/family`);
  }

  const [student, linkedStudents] = await Promise.all([
    getFamilyStudentPreview(session.schoolId, session.activeStudentId),
    session.viewer === "parent"
      ? listFamilyStudentPreviews(session.schoolId, session.studentIds)
      : Promise.resolve([]),
  ]);
  if (!student) {
    redirect(`/${workspace}/family`);
  }

  return (
    <FamilyShell
      workspace={workspace}
      schoolName={school.name}
      viewer={session.viewer}
      student={student}
      linkedStudents={linkedStudents}
      nav={familyModules}
      signOutAction={familySignOutAction}
      switchChildAction={familySwitchChildAction}
    >
      {children}
    </FamilyShell>
  );
}
