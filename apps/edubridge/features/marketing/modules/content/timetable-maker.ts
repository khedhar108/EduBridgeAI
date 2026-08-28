import type { ModulePage } from "../types";

export const timetableMakerPage: ModulePage = {
  slug: "timetable-maker",
  title: "Timetable Maker",
  tagline: "Clash-free periods with export and history.",
  summary:
    "Build period grids that flag teacher double-booking, export to Excel, and keep a change history.",
  audience: "School admins, designated staff",
  readingMinutes: 4,
  icon: "calendar-days",
  hero: {
    label: "Week canvas",
    aspect: "16 / 9",
  },
  highlights: [
    "Double-book highlights before publish",
    "Excel export for staff handouts",
    "Version history when the term shifts",
  ],
  sections: [
    {
      heading: "The job",
      body: "Build a week that teachers can actually teach. Flag double-booking early, export cleanly, and keep prior versions when the term shifts.",
      media: {
        label: "Clash highlight grid",
        aspect: "4 / 3",
      },
    },
    {
      heading: "Who uses it",
      body: "School admins and designated staff publish. Teachers view their own timetable. Students and parents see their slice later through the dashboard.",
      media: {
        label: "Teacher week strip",
        aspect: "16 / 10",
      },
    },
  ],
};
