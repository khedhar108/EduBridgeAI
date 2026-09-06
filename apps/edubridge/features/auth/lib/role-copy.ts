/** Short role explanations for admin UI (directory, provision, activate). */
export const ROLE_SUMMARIES: Record<string, string> = {
  school_admin:
    "Full control of this school. There is one school admin, and that role cannot be granted here.",
  coordinator:
    "Manages staff accounts. Extra permissions (Fees writes, archive, Login as) stay off until you enable them here.",
  accountant:
    "Records what students paid. Publish structures and other extras stay off until enabled here.",
  teacher:
    "Works with assigned class-subjects. Extra modules stay off until enabled here.",
  staff: "School-office access. Extra modules stay off until enabled here.",
  student: "Sees only their own records.",
  parent: "Sees linked children's records.",
};
