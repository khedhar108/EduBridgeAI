import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;

const schoolInviteRoles = [
  "school_admin",
  "accountant",
  "teacher",
  "staff",
  "student",
  "parent",
] as const;

export const inviteMemberSchema = z.object({
  email: z.string().email().max(320),
  role: z.enum(schoolInviteRoles),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const acceptInviteSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  password: z.string().min(8).max(128),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

/** Domain join activates as teacher/staff/accountant (admin may also choose school_admin). */
export const activateMemberSchema = z.object({
  requestId: z.string().uuid(),
  role: z.enum(["school_admin", "accountant", "teacher", "staff"]),
});

export type ActivateMemberInput = z.infer<typeof activateMemberSchema>;

export const schoolDomainSignUpSchema = z.object({
  email: z.string().email().max(320),
  fullName: z.string().trim().min(2).max(160),
  password: z.string().min(8).max(128),
});

export type SchoolDomainSignUpInput = z.infer<typeof schoolDomainSignUpSchema>;
