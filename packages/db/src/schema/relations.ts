import { relations } from "drizzle-orm";
import { invitations } from "./invitations";
import { membershipRequests } from "./membership-requests";
import { profiles } from "./profiles";
import { schoolMembers } from "./school-members";
import { schools } from "./schools";

export const schoolsRelations = relations(schools, ({ many }) => ({
  members: many(schoolMembers),
  invitations: many(invitations),
  membershipRequests: many(membershipRequests),
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
