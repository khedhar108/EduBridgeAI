import { relations } from "drizzle-orm";
import {
  activities,
  assessments,
  attendanceRecords,
  classes,
  classEnrollments,
  classStaffDelegations,
  classSubjects,
  marks,
  shareRequests,
  subjects,
  teacherAssignments,
} from "./academic";
import {
  feeAuditEvents,
  feePayments,
  feePlans,
  feePlanVersions,
  studentFeeAssignments,
} from "./fees";
import { membershipRequests } from "./membership-requests";
import { profiles } from "./profiles";
import { schoolMembers } from "./school-members";
import { schools } from "./schools";
import { parentLinks, studentGuardians, students } from "./students";

export const schoolsRelations = relations(schools, ({ many }) => ({
  members: many(schoolMembers),
  membershipRequests: many(membershipRequests),
  students: many(students),
  classes: many(classes),
  feePlans: many(feePlans),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(schoolMembers),
  membershipRequests: many(membershipRequests),
}));

export const schoolMembersRelations = relations(schoolMembers, ({ one }) => ({
  school: one(schools, {
    fields: [schoolMembers.schoolId],
    references: [schools.id],
  }),
  profile: one(profiles, {
    fields: [schoolMembers.userId],
    references: [profiles.id],
  }),
}));

export const membershipRequestsRelations = relations(
  membershipRequests,
  ({ one }) => ({
    school: one(schools, {
      fields: [membershipRequests.schoolId],
      references: [schools.id],
    }),
    profile: one(profiles, {
      fields: [membershipRequests.userId],
      references: [profiles.id],
    }),
    reviewer: one(profiles, {
      fields: [membershipRequests.reviewedBy],
      references: [profiles.id],
    }),
  }),
);

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id],
  }),
  guardians: many(studentGuardians),
  parentLinks: many(parentLinks),
  enrollments: many(classEnrollments),
  feeAssignment: many(studentFeeAssignments),
}));

export const studentGuardiansRelations = relations(
  studentGuardians,
  ({ one }) => ({
    student: one(students, {
      fields: [studentGuardians.studentId],
      references: [students.id],
    }),
  }),
);

export const parentLinksRelations = relations(parentLinks, ({ one }) => ({
  student: one(students, {
    fields: [parentLinks.studentId],
    references: [students.id],
  }),
  school: one(schools, {
    fields: [parentLinks.schoolId],
    references: [schools.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id],
  }),
  offerings: many(classSubjects),
  enrollments: many(classEnrollments),
  staffDelegations: many(classStaffDelegations),
  attendance: many(attendanceRecords),
  assessments: many(assessments),
  activities: many(activities),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school: one(schools, {
    fields: [subjects.schoolId],
    references: [schools.id],
  }),
  offerings: many(classSubjects),
}));

export const classSubjectsRelations = relations(
  classSubjects,
  ({ one, many }) => ({
    school: one(schools, {
      fields: [classSubjects.schoolId],
      references: [schools.id],
    }),
    class: one(classes, {
      fields: [classSubjects.classId],
      references: [classes.id],
    }),
    subject: one(subjects, {
      fields: [classSubjects.subjectId],
      references: [subjects.id],
    }),
    teacherAssignments: many(teacherAssignments),
    assessments: many(assessments),
  }),
);

export const teacherAssignmentsRelations = relations(
  teacherAssignments,
  ({ one }) => ({
    school: one(schools, {
      fields: [teacherAssignments.schoolId],
      references: [schools.id],
    }),
    offering: one(classSubjects, {
      fields: [teacherAssignments.classSubjectId],
      references: [classSubjects.id],
    }),
    teacher: one(profiles, {
      fields: [teacherAssignments.teacherUserId],
      references: [profiles.id],
    }),
  }),
);

export const classStaffDelegationsRelations = relations(
  classStaffDelegations,
  ({ one }) => ({
    school: one(schools, {
      fields: [classStaffDelegations.schoolId],
      references: [schools.id],
    }),
    class: one(classes, {
      fields: [classStaffDelegations.classId],
      references: [classes.id],
    }),
    staff: one(profiles, {
      fields: [classStaffDelegations.userId],
      references: [profiles.id],
    }),
  }),
);

export const classEnrollmentsRelations = relations(
  classEnrollments,
  ({ one }) => ({
    school: one(schools, {
      fields: [classEnrollments.schoolId],
      references: [schools.id],
    }),
    class: one(classes, {
      fields: [classEnrollments.classId],
      references: [classes.id],
    }),
    student: one(students, {
      fields: [classEnrollments.studentId],
      references: [students.id],
    }),
  }),
);

export const attendanceRecordsRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    school: one(schools, {
      fields: [attendanceRecords.schoolId],
      references: [schools.id],
    }),
    class: one(classes, {
      fields: [attendanceRecords.classId],
      references: [classes.id],
    }),
    student: one(students, {
      fields: [attendanceRecords.studentId],
      references: [students.id],
    }),
  }),
);

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  school: one(schools, {
    fields: [assessments.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [assessments.classId],
    references: [classes.id],
  }),
  offering: one(classSubjects, {
    fields: [assessments.classSubjectId],
    references: [classSubjects.id],
  }),
  marks: many(marks),
}));

export const marksRelations = relations(marks, ({ one }) => ({
  school: one(schools, {
    fields: [marks.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [marks.classId],
    references: [classes.id],
  }),
  assessment: one(assessments, {
    fields: [marks.assessmentId],
    references: [assessments.id],
  }),
  student: one(students, {
    fields: [marks.studentId],
    references: [students.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  school: one(schools, {
    fields: [activities.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [activities.classId],
    references: [classes.id],
  }),
  student: one(students, {
    fields: [activities.studentId],
    references: [students.id],
  }),
}));

export const shareRequestsRelations = relations(shareRequests, ({ one }) => ({
  school: one(schools, {
    fields: [shareRequests.schoolId],
    references: [schools.id],
  }),
  student: one(students, {
    fields: [shareRequests.studentId],
    references: [students.id],
  }),
  requester: one(profiles, {
    fields: [shareRequests.requestedBy],
    references: [profiles.id],
  }),
}));

export const feePlansRelations = relations(feePlans, ({ one, many }) => ({
  school: one(schools, {
    fields: [feePlans.schoolId],
    references: [schools.id],
  }),
  versions: many(feePlanVersions),
}));

export const feePlanVersionsRelations = relations(
  feePlanVersions,
  ({ one, many }) => ({
    plan: one(feePlans, {
      fields: [feePlanVersions.planId],
      references: [feePlans.id],
    }),
    assignments: many(studentFeeAssignments),
  }),
);

export const studentFeeAssignmentsRelations = relations(
  studentFeeAssignments,
  ({ one, many }) => ({
    student: one(students, {
      fields: [studentFeeAssignments.studentId],
      references: [students.id],
    }),
    planVersion: one(feePlanVersions, {
      fields: [studentFeeAssignments.planVersionId],
      references: [feePlanVersions.id],
    }),
    payments: many(feePayments),
  }),
);

export const feePaymentsRelations = relations(feePayments, ({ one }) => ({
  assignment: one(studentFeeAssignments, {
    fields: [feePayments.assignmentId],
    references: [studentFeeAssignments.id],
  }),
  student: one(students, {
    fields: [feePayments.studentId],
    references: [students.id],
  }),
}));

export const feeAuditEventsRelations = relations(feeAuditEvents, ({ one }) => ({
  school: one(schools, {
    fields: [feeAuditEvents.schoolId],
    references: [schools.id],
  }),
  actor: one(profiles, {
    fields: [feeAuditEvents.actorId],
    references: [profiles.id],
  }),
}));
