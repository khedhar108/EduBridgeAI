import { SchoolStudentDetailPage } from "@/features/student-dashboard";

type Props = {
  params: Promise<{ workspace: string; studentId: string }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { workspace, studentId } = await params;
  return (
    <SchoolStudentDetailPage workspace={workspace} studentId={studentId} />
  );
}
