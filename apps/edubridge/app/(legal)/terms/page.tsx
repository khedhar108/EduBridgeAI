import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/brand";
import { LegalDocument, TERMS_INTRO, TERMS_SECTIONS, TERMS_TITLE } from "@/features/legal";

export const metadata: Metadata = {
  title: `Terms of Use | ${PLATFORM_NAME}`,
  description: `Draft terms for ${PLATFORM_NAME}.`,
};

export default function TermsPage() {
  return (
    <LegalDocument
      title={TERMS_TITLE}
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
    />
  );
}
