export { FamilyShell } from "./components/family-shell";
export { FamilyHome } from "./components/family-home";
export { FamilyFees } from "./components/family-fees";
export { FamilyProgress } from "./components/family-progress";
export { FamilyExams } from "./components/family-exams";
export { FamilyEvents } from "./components/family-events";
export { FamilyPageIntro } from "./components/family-page-intro";
export { ChildSwitcher } from "./components/child-switcher";
export { SchoolStudentsPage } from "./components/school-students-page";
export { SchoolStudentDetailPage } from "./components/school-student-detail-page";
export {
  getFamilyFeeSummary,
  type FamilyFeeSummary,
} from "./queries/get-family-fee";
export {
  getFamilyAttendanceSummary,
  getFamilyExamMarks,
  getFamilyEvents,
} from "./queries/get-family-academic";
export type {
  FamilyNavItem,
  FamilyStudentSummary,
  FamilyFeeHint,
} from "./types";
export { isStudentDashboardRole, STUDENT_DASHBOARD_ROLES } from "./lib/roles";
