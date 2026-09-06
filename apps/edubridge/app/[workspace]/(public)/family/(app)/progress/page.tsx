import { FamilyProgress, getFamilyAttendanceSummary } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyProgressPage({ params }: Props) {
  const { workspace } = await params;
  const session = await requireFamilySession(workspace);
  const summary = await getFamilyAttendanceSummary(
    session.schoolId,
    session.activeStudentId,
  );

  return <FamilyProgress summary={summary} />;
}
