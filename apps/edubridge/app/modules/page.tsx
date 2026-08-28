import { ModuleIndex } from "@/features/marketing/modules";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modules | EduBridge",
  description:
    "Explore EduBridge modules: dashboard, fees, reports, timetable, AI assist, and more.",
};

export default function ModulesPage() {
  return <ModuleIndex />;
}
