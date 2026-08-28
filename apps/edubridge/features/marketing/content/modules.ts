import type { LucideIcon } from "lucide-react";
import {
  CalendarDaysIcon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  SparklesIcon,
  WalletIcon,
} from "lucide-react";

export type MarketingModule = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  audience: string;
  /** Interactive card → marketing module showcase */
  href: string;
  /** Asymmetric bento span hint */
  span: "wide" | "tall" | "default";
  Icon: LucideIcon;
  /** Curated light-theme pastel surface tint (marketing-only) */
  tint: "mint" | "sky" | "amber" | "rose" | "violet" | "stone";
};

/**
 * Marketing module showcase (not shell registry).
 * Cards route to `/modules/[slug]` product showcases.
 */
export const MARKETING_MODULES: MarketingModule[] = [
  {
    id: "student-dashboard",
    title: "Student Dashboard",
    summary: "Attendance, marks, and activity in one calm view.",
    detail:
      "Teachers and staff log day-to-day signals. Students and parents see charts and updates for their own slice, never another school's data.",
    audience: "Teachers, staff, students, parents",
    href: "/modules/student-dashboard",
    span: "wide",
    Icon: LayoutDashboardIcon,
    tint: "sky",
  },
  {
    id: "ai-assist",
    title: "AI Assist",
    summary: "Drafts inside the fence. Humans approve every write.",
    detail:
      "Summaries, change detection, and WhatsApp delivery run with scoped tokens. Assistants never write tenant rows on their own.",
    audience: "Cross-module, role-gated",
    href: "/modules/ai-assist",
    span: "tall",
    Icon: SparklesIcon,
    tint: "violet",
  },
  {
    id: "timetable-maker",
    title: "Timetable Maker",
    summary: "Clash-free periods with export and history.",
    detail:
      "Build period grids that flag teacher double-booking, export to Excel, and keep a change history.",
    audience: "School admins, designated staff",
    href: "/modules/timetable-maker",
    span: "default",
    Icon: CalendarDaysIcon,
    tint: "mint",
  },
  {
    id: "report-card-designer",
    title: "Report Card Designer",
    summary: "Draft, approve, and publish term reports.",
    detail:
      "Periodic, half-yearly, and annual cards with an approval path before parents see them. PDF export stays inside the tenant fence.",
    audience: "Teachers, school admins",
    href: "/modules/report-card-designer",
    span: "default",
    Icon: ClipboardListIcon,
    tint: "amber",
  },
  {
    id: "fee-structure",
    title: "Fee Structure",
    summary: "Plans, installments, and clear parent-facing totals.",
    detail:
      "Define fee heads, class bands, and payment schedules once. Parents see what they owe without spreadsheet archaeology.",
    audience: "School admins, accounts staff",
    href: "/modules/fee-structure",
    span: "default",
    Icon: WalletIcon,
    tint: "rose",
  },
  {
    id: "receipt-creation",
    title: "Receipt Creation",
    summary: "Printable receipts that match your fee ledger.",
    detail:
      "Issue receipts from collected payments with school branding, serial numbers, and a trail that reconciles to the fee structure.",
    audience: "Accounts staff, school admins",
    href: "/modules/receipt-creation",
    span: "default",
    Icon: ReceiptIcon,
    tint: "stone",
  },
  {
    id: "test-paper-creator",
    title: "Test Paper Creator",
    summary: "Question banks and print-ready papers.",
    detail:
      "Assemble quizzes from templates and banks, optionally with AI candidates you curate. Staff-only, never shown to students.",
    audience: "Teachers, school admins",
    href: "/modules/test-paper-creator",
    span: "wide",
    Icon: FileTextIcon,
    tint: "sky",
  },
];

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  readingMinutes: number;
  moduleId: string;
  sections: { heading: string; body: string }[];
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "student-dashboard",
    title: "Student Dashboard: one place for the day-to-day",
    description:
      "How EduBridge turns attendance, marks, and activity into a calm, role-aware view for teachers, parents, and students.",
    readingMinutes: 4,
    moduleId: "student-dashboard",
    sections: [
      {
        heading: "Why it matters",
        body: "Schools already track everything. The friction is stitching it together for the right person. The dashboard is the first module parents and students open, so clarity beats spectacle.",
      },
      {
        heading: "What ships",
        body: "Class and student scopes, attendance and marks signals, and charts that stay inside the tenant fence. Teachers see their classes. Parents see their children. Platform owners never browse school rows from here.",
      },
      {
        heading: "AI later",
        body: "Summaries and change callouts land through AI Assist with human approval. The dashboard itself stays a read surface first.",
      },
    ],
  },
  {
    slug: "ai-assist",
    title: "AI Assist: drafts inside the fence",
    description:
      "Scoped tokens, human approval, and workflows that never write tenant data on their own.",
    readingMinutes: 5,
    moduleId: "ai-assist",
    sections: [
      {
        heading: "The rule",
        body: "Assistants draft. Humans approve. Writes go through server actions with the same role checks as the rest of EduBridge.",
      },
      {
        heading: "Where it shows up",
        body: "Report narratives, WhatsApp delivery drafts, change detection across student activity, and later homework digests from the timetable.",
      },
      {
        heading: "Trust model",
        body: "Memory is resource-scoped per user. Service tokens carry school and role claims. Cross-tenant prompts are a hard fail.",
      },
    ],
  },
  {
    slug: "timetable-maker",
    title: "Timetable Maker: clash-free periods",
    description:
      "Period canvas, double-book highlights, Excel export, and a history trail for school admins.",
    readingMinutes: 4,
    moduleId: "timetable-maker",
    sections: [
      {
        heading: "The job",
        body: "Build a week that teachers can actually teach. Flag double-booking early, export cleanly, and keep prior versions when the term shifts.",
      },
      {
        heading: "Who uses it",
        body: "School admins and designated staff publish. Teachers view their own timetable. Students and parents see their slice later through the dashboard.",
      },
    ],
  },
  {
    slug: "report-card-designer",
    title: "Report Card Designer: approve before publish",
    description:
      "Templates, drafts, approval, and PDF export that stay inside the school workspace.",
    readingMinutes: 5,
    moduleId: "report-card-designer",
    sections: [
      {
        heading: "Workflow",
        body: "Teachers draft. Admins approve. Parents receive a published snapshot, not a live editable sheet. Immutability after publish protects audit trails.",
      },
      {
        heading: "Design, not decoration",
        body: "Layouts follow your school templates. AI can suggest narrative text; a human still signs off before anything leaves the fence.",
      },
    ],
  },
  {
    slug: "fee-structure",
    title: "Fee Structure: plans parents can understand",
    description:
      "Fee heads, class bands, and installments without spreadsheet chaos.",
    readingMinutes: 4,
    moduleId: "fee-structure",
    sections: [
      {
        heading: "Structure first",
        body: "Define what the school charges once. Map heads to classes and terms. Installments stay explicit so collections teams and parents share one truth.",
      },
      {
        heading: "Coming later",
        body: "Full fees and spending analytics land in a later phase. The structure module is the foundation receipts and parent app balances build on.",
      },
    ],
  },
  {
    slug: "receipt-creation",
    title: "Receipt Creation: ledger-grade proof of payment",
    description:
      "Serials, branding, and reconciliation back to the fee structure.",
    readingMinutes: 3,
    moduleId: "receipt-creation",
    sections: [
      {
        heading: "What a receipt must do",
        body: "Prove payment, name the fee head, and leave a trail accounts can reconcile. Print and PDF stay on-brand without leaving the workspace.",
      },
      {
        heading: "Tied to fees",
        body: "Receipts never invent amounts. They reference the fee structure and recorded collections so the books stay coherent.",
      },
    ],
  },
  {
    slug: "test-paper-creator",
    title: "Test Paper Creator: banks to print-ready papers",
    description:
      "Templates, question banks, and optional AI candidates teachers still curate.",
    readingMinutes: 4,
    moduleId: "test-paper-creator",
    sections: [
      {
        heading: "Staff only",
        body: "Students and parents never see this module. Papers are exam-sensitive and stay behind role gates.",
      },
      {
        heading: "AI as a draft partner",
        body: "Generate candidate questions, then curate. Final papers snapshot question text so later bank edits do not rewrite history.",
      },
    ],
  },
];

export function getArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getModuleById(id: string): MarketingModule | undefined {
  return MARKETING_MODULES.find((m) => m.id === id);
}
