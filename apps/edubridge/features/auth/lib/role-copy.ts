/** Short role explanations for admin UI (directory, provision, activate). */
export const ROLE_SUMMARIES: Record<string, string> = {
  school_admin:
    "Full control of this school. There is one school admin, and that role cannot be granted here.",
  coordinator:
    "Manages staff accounts. Cannot change roles, archive members, impersonate, or open Fees.",
  accountant: "Handles fees and payments for this school only.",
  teacher: "Works with assigned classes. Cannot manage members or fees.",
  staff: "School-office access without teaching or fees.",
  student: "Sees only their own records.",
  parent: "Sees linked children's records.",
};
