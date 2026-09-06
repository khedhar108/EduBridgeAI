import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  LegalDocument,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
} from "@/features/legal";

export const metadata: Metadata = {
  title: `Privacy Policy | ${PLATFORM_NAME}`,
  description: `Draft privacy policy for ${PLATFORM_NAME}.`,
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title={PRIVACY_TITLE}
      intro={PRIVACY_INTRO}
      sections={PRIVACY_SECTIONS}
    />
  );
}
