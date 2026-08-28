import type { ModulePage } from "../types";

export const testPaperCreatorPage: ModulePage = {
  slug: "test-paper-creator",
  title: "Test Paper Creator",
  tagline: "Question banks and print-ready papers.",
  summary:
    "Assemble quizzes from templates and banks, optionally with AI candidates you curate. Staff-only, never shown to students.",
  audience: "Teachers, school admins",
  readingMinutes: 4,
  icon: "file-text",
  hero: {
    label: "Paper assembly canvas",
    aspect: "16 / 9",
  },
  highlights: [
    "Staff-only, exam-sensitive",
    "Banks and templates to print-ready papers",
    "AI candidates teachers still curate",
  ],
  sections: [
    {
      heading: "Staff only",
      body: "Students and parents never see this module. Papers are exam-sensitive and stay behind role gates.",
      media: {
        label: "Question bank browser",
        aspect: "4 / 3",
      },
    },
    {
      heading: "AI as a draft partner",
      body: "Generate candidate questions, then curate. Final papers snapshot question text so later bank edits do not rewrite history.",
      media: {
        label: "Print-ready paper",
        aspect: "3 / 4",
      },
    },
  ],
};
