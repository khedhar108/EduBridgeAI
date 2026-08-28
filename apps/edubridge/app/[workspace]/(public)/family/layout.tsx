import { notFound } from "next/navigation";
import { getPublicSchoolBySlug } from "@/features/auth";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
};

export default async function FamilyRoutesLayout({ children, params }: Props) {
  const { workspace } = await params;
  const school = await getPublicSchoolBySlug(workspace);
  if (!school) notFound();

  return children;
}
