import { redirect } from "next/navigation";
import { getFamilyStudentPreview } from "@/features/auth";
import { familyModules } from "@/features/shell";
import { FamilyHome, getFamilyFeeSummary } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyHomePage({ params }: Props) {
  const { workspace } = await params;
  const session = await requireFamilySession(workspace);
  const student = await getFamilyStudentPreview(
    session.schoolId,
    session.activeStudentId,
  );
  if (!student) {
    redirect(`/${workspace}/family`);
  }

  const fee = await getFamilyFeeSummary(
    session.schoolId,
    session.activeStudentId,
  );
  const destinations = familyModules.filter((item) => item.id !== "family-home");

  return (
    <FamilyHome
      workspace={workspace}
      viewer={session.viewer}
      student={student}
      destinations={destinations}
      feeHint={
        fee
          ? { hasPlan: true, dueInr: fee.dueInr }
          : { hasPlan: false, dueInr: 0 }
      }
    />
  );
}
