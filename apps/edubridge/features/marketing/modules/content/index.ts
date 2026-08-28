import type { ModulePage } from "../types";
import { aiAssistPage } from "./ai-assist";
import { feeStructurePage } from "./fee-structure";
import { receiptCreationPage } from "./receipt-creation";
import { reportCardDesignerPage } from "./report-card-designer";
import { studentDashboardPage } from "./student-dashboard";
import { testPaperCreatorPage } from "./test-paper-creator";
import { timetableMakerPage } from "./timetable-maker";

/** All marketing module showcase pages — add a file here when a card ships. */
export const MODULE_PAGES: ModulePage[] = [
  studentDashboardPage,
  aiAssistPage,
  timetableMakerPage,
  reportCardDesignerPage,
  feeStructurePage,
  receiptCreationPage,
  testPaperCreatorPage,
];

export function getModulePage(slug: string): ModulePage | undefined {
  return MODULE_PAGES.find((page) => page.slug === slug);
}

export function listModulePages(): ModulePage[] {
  return MODULE_PAGES;
}
