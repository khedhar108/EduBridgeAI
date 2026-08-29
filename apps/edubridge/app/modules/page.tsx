import { ModuleIndex } from "@/features/marketing/modules";
import { SiteFooter } from "@/features/legal";
import { PLATFORM_NAME } from "@/lib/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Modules | ${PLATFORM_NAME}`,
  description: `Explore ${PLATFORM_NAME} modules: dashboard, fees, reports, timetable, AI assist, and more.`,
};

export default function ModulesPage() {
  return (
    <>
      <ModuleIndex />
      <SiteFooter />
    </>
  );
}
