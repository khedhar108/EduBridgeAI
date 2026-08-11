import type { ModulePage } from "../types";

export const studentDashboardPage: ModulePage = {
  slug: "student-dashboard",
  title: "Student Dashboard",
  tagline: "Attendance, marks, and activity in one calm view.",
  summary:
    "Teachers and staff log day-to-day signals. Students and parents see charts and updates for their own slice, never another school's data.",
  audience: "Teachers, staff, students, parents",
  readingMinutes: 4,
  icon: "layout-dashboard",
  hero: {
    label: "Dashboard overview",
    aspect: "16 / 9",
  },
  highlights: [
    "Role-filtered scopes for class, child, and self",
    "Attendance and marks as first-class signals",
    "Charts that stay inside the tenant fence",
  ],
  sections: [
    {
      heading: "Why it matters",
      body: "Schools already track everything. The friction is stitching it together for the right person. The dashboard is the first module parents and students open, so clarity beats spectacle.",
      media: {
        label: "Role-aware day view",
        aspect: "4 / 3",
      },
    },
    {
      heading: "What ships",
      body: "Class and student scopes, attendance and marks signals, and charts that stay inside the tenant fence. Teachers see their classes. Parents see their children. Platform owners never browse school rows from here.",
    },
    {
      heading: "AI later",
      body: "Summaries and change callouts land through AI Assist with human approval. The dashboard itself stays a read surface first.",
      media: {
        label: "Activity timeline mock",
        aspect: "16 / 10",
      },
    },
  ],
};
