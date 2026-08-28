import type { ModulePage } from "../types";

export const reportCardDesignerPage: ModulePage = {
  slug: "report-card-designer",
  title: "Report Card Designer",
  tagline: "Draft, approve, and publish term reports.",
  summary:
    "Periodic, half-yearly, and annual cards with an approval path before parents see them. PDF export stays inside the tenant fence.",
  audience: "Teachers, school admins",
  readingMinutes: 5,
  icon: "clipboard-list",
  hero: {
    label: "Report card canvas",
    aspect: "16 / 9",
  },
  highlights: [
    "Draft → approve → publish workflow",
    "School templates, not one-size layouts",
    "Immutable snapshot after publish",
  ],
  sections: [
    {
      heading: "Workflow",
      body: "Teachers draft. Admins approve. Parents receive a published snapshot, not a live editable sheet. Immutability after publish protects audit trails.",
      media: {
        label: "Approval states",
        aspect: "4 / 3",
      },
    },
    {
      heading: "Design, not decoration",
      body: "Layouts follow your school templates. AI can suggest narrative text; a human still signs off before anything leaves the fence.",
      media: {
        label: "Template gallery",
        aspect: "16 / 10",
      },
    },
  ],
};
