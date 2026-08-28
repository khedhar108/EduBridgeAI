import { notFound, redirect } from "next/navigation";
import { FamilyAddChildForm, getPublicSchoolBySlug } from "@/features/auth";
import { FamilyPageIntro } from "@/features/student-dashboard";
import { requireFamilySession } from "@/lib/tenancy/family-session";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FamilyAddChildPage({ params }: Props) {
  const { workspace } = await params;
  const [session, school] = await Promise.all([
    requireFamilySession(workspace),
    getPublicSchoolBySlug(workspace),
  ]);
  if (!school) notFound();
  if (session.viewer !== "parent") {
    redirect(`/${workspace}/family/home`);
  }

  return (
    <div className="flex flex-col gap-6">
      <FamilyPageIntro
        title="Add a child"
        description="Prove another admission number and date of birth. You still see one child at a time — use the switcher after they are linked."
      />
      <FamilyAddChildForm workspace={workspace} schoolName={school.name} />
    </div>
  );
}
