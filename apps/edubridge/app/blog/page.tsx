import type { Metadata } from "next";
import { BlogIndex } from "@/features/marketing";
import { SiteFooter } from "@/features/legal";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Product notes | ${PLATFORM_NAME}`,
  description: `Module overviews for ${PLATFORM_NAME}: student dashboard, AI assist, timetable, report cards, fees, and receipts.`,
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-dvh bg-background">
      <BlogIndex />
      <SiteFooter />
    </div>
  );
}
