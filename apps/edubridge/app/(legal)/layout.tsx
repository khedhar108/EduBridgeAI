import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/brand";
import { SiteFooter } from "@/features/legal";

export const metadata: Metadata = {
  title: `Legal | ${PLATFORM_NAME}`,
};

export default function LegalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
