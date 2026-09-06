import { FamilyExams, getFamilyExamMarks } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyExamsPage({ params }: Props) {
  const { workspace } = await params;
  const session = await requireFamilySession(workspace);
  const marks = await getFamilyExamMarks(
    session.schoolId,
    session.activeStudentId,
  );

  return <FamilyExams marks={marks} />;
}
