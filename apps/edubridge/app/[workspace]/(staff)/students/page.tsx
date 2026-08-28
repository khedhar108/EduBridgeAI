import { SchoolStudentsPage } from "@/features/student-dashboard";

type Props = {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ class?: string; date?: string }>;
};

export default async function StudentsPage({ params, searchParams }: Props) {
  const { workspace } = await params;
  const query = await searchParams;
  return (
    <SchoolStudentsPage
      workspace={workspace}
      classId={query.class}
      onDate={query.date}
    />
  );
}
