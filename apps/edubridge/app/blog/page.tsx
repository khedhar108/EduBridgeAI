import type { Metadata } from "next";
import { BlogIndex } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Product notes | EduBridge",
  description:
    "Module overviews for EduBridge: student dashboard, AI assist, timetable, report cards, fees, and receipts.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-dvh bg-background">
      <BlogIndex />
    </div>
  );
}
