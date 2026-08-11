import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getModulePage,
  listModulePages,
  ModuleShowcase,
} from "@/features/marketing/modules";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listModulePages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getModulePage(slug);
  if (!page) return { title: "Module | EduBridge" };
  return {
    title: `${page.title} | EduBridge`,
    description: page.summary,
  };
}

export default async function ModulePageRoute({ params }: Props) {
  const { slug } = await params;
  const page = getModulePage(slug);
  if (!page) notFound();

  return <ModuleShowcase page={page} />;
}
