import type { ModulePage } from "../types";
import { PLATFORM_NAME } from "@/lib/brand";

export const aiAssistPage: ModulePage = {
  slug: "ai-assist",
  title: "AI Assist",
  tagline: "Drafts inside the fence. Humans approve every write.",
  summary:
    "Summaries, change detection, and WhatsApp delivery run with scoped tokens. Assistants never write tenant rows on their own.",
  audience: "Cross-module, role-gated",
  readingMinutes: 5,
  icon: "sparkles",
  hero: {
    label: "AI assist dock",
    aspect: "16 / 9",
  },
  highlights: [
    "Assistants draft; humans approve",
    "Scoped service tokens with school and role claims",
    "Cross-tenant prompts hard-fail",
  ],
  sections: [
    {
      heading: "The rule",
      body: `Assistants draft. Humans approve. Writes go through server actions with the same role checks as the rest of ${PLATFORM_NAME}.`,
      media: {
        label: "Approval checklist UI",
        aspect: "4 / 3",
      },
    },
    {
      heading: "Where it shows up",
      body: "Report narratives, WhatsApp delivery drafts, change detection across student activity, and later homework digests from the timetable.",
    },
    {
      heading: "Trust model",
      body: "Memory is resource-scoped per user. Service tokens carry school and role claims. Cross-tenant prompts are a hard fail.",
      media: {
        label: "Fence diagram",
        aspect: "16 / 10",
      },
    },
  ],
};
