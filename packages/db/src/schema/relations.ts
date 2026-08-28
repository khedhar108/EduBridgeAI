import { relations } from "drizzle-orm";
import {
  feeAuditEvents,
  feePayments,
  feePlans,
  feePlanVersions,
  studentFeeAssignments,
} from "./fees";
import { invitations } from "./invitations";
import { membershipRequests } from "./membership-requests";
import { profiles } from "./profiles";
import { schoolMembers } from "./school-members";
import { schools } from "./schools";
import { studentGuardians, students } from "./students";

export const schoolsRelations = relations(schools, ({ many }) => ({
  members: many(schoolMembers),
  invitations: many(invitations),
  membershipRequests: many(membershipRequests),
  students: many(students),
  feePlans: many(feePlans),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(schoolMembers),
  invitationsSent: many(invitations),
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

export const invitationsRelations = relations(invitations, ({ one }) => ({
  school: one(schools, {
    fields: [invitations.schoolId],
    references: [schools.id],
  }),
  inviter: one(profiles, {
    fields: [invitations.invitedBy],
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
