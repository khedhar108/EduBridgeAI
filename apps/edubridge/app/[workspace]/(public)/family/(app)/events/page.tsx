import { FamilyEvents, getFamilyEvents } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyEventsPage({ params }: Props) {
  const { workspace } = await params;
  const session = await requireFamilySession(workspace);
  const events = await getFamilyEvents(
    session.schoolId,
    session.activeStudentId,
  );

  return <FamilyEvents events={events} />;
}
