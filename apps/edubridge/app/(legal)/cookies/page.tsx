import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  CookieInventoryTable,
  COOKIES_INTRO,
  COOKIES_SECTIONS,
  COOKIES_TITLE,
  LegalDocument,
} from "@/features/legal";

export const metadata: Metadata = {
  title: `Cookie Policy | ${PLATFORM_NAME}`,
  description: `How ${PLATFORM_NAME} uses cookies and local storage.`,
};

export default function CookiesPage() {
  return (
    <LegalDocument
      title={COOKIES_TITLE}
      intro={COOKIES_INTRO}
      sections={COOKIES_SECTIONS}
      table={<CookieInventoryTable />}
    />
  );
}
