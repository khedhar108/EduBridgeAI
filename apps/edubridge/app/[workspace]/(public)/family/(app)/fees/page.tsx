import { FamilyFees, getFamilyFeeSummary } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyFeesPage({ params }: Props) {
  const { workspace } = await params;
  const session = await requireFamilySession(workspace);
  const summary = await getFamilyFeeSummary(
    session.schoolId,
    session.activeStudentId,
  );

  return <FamilyFees summary={summary} />;
}
