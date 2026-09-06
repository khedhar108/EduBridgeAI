export const queryKeys = {
  root: ["edubridge"] as const,

  school: (schoolId: string) =>
    [...queryKeys.root, "school", schoolId] as const,

  user: (schoolId: string, userId: string) =>
    [...queryKeys.school(schoolId), "user", userId] as const,

  students: {
    all: (schoolId: string) =>
      [...queryKeys.school(schoolId), "students"] as const,
    roster: (
      schoolId: string,
      userId: string,
      classId: string,
      date: string,
    ) =>
      [
        ...queryKeys.user(schoolId, userId),
        "students",
        "roster",
        classId,
        date,
      ] as const,
    recordAttendance: () =>
      [...queryKeys.root, "students", "record-attendance"] as const,
    recordActivity: () =>
      [...queryKeys.root, "students", "record-activity"] as const,
  },

  fees: {
    all: (schoolId: string, userId: string) =>
      [...queryKeys.user(schoolId, userId), "fees"] as const,
    recordPayment: () => [...queryKeys.root, "fees", "record-payment"] as const,
    registerStudent: () =>
      [...queryKeys.root, "fees", "register-student"] as const,
    publishPlan: () => [...queryKeys.root, "fees", "publish-plan"] as const,
  },

  auth: {
    usernameCheck: (schoolSlug: string, username: string) =>
      [...queryKeys.root, "auth", "username-check", schoolSlug, username] as const,
    setHubFlag: () => [...queryKeys.root, "auth", "set-hub-flag"] as const,
    activateMember: () =>
      [...queryKeys.root, "auth", "activate-member"] as const,
    rejectMember: () => [...queryKeys.root, "auth", "reject-member"] as const,
    provisionMember: () =>
      [...queryKeys.root, "auth", "provision-member"] as const,
    resetMemberPassword: () =>
      [...queryKeys.root, "auth", "reset-member-password"] as const,
    toggleMember: () => [...queryKeys.root, "auth", "toggle-member"] as const,
    archiveMember: () => [...queryKeys.root, "auth", "archive-member"] as const,
    changeMemberRole: () =>
      [...queryKeys.root, "auth", "change-member-role"] as const,
    signIn: () => [...queryKeys.root, "auth", "sign-in"] as const,
    familySignIn: () => [...queryKeys.root, "auth", "family-sign-in"] as const,
    familyAddChild: () =>
      [...queryKeys.root, "auth", "family-add-child"] as const,
    schoolDomainSignUp: () =>
      [...queryKeys.root, "auth", "school-domain-sign-up"] as const,
    forgotPassword: () =>
      [...queryKeys.root, "auth", "forgot-password"] as const,
    updatePassword: () =>
      [...queryKeys.root, "auth", "update-password"] as const,
  },

  registration: {
    slugCheck: (slug: string) =>
      [...queryKeys.root, "registration", "slug-check", slug] as const,
    start: () => [...queryKeys.root, "registration", "start"] as const,
    verifyOtp: () => [...queryKeys.root, "registration", "verify-otp"] as const,
    resendOtp: () => [...queryKeys.root, "registration", "resend-otp"] as const,
  },
};
