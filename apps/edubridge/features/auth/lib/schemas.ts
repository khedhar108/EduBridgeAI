import { z } from "zod";
import { USERNAME_PATTERN } from "./username";

export const signInSchema = z.object({
  /** Accepts an email or a username; the action resolves usernames to emails. */
  email: z.string().min(2).max(320),
  password: z.string().min(8).max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;

const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters.")
  .max(64)
  .regex(USERNAME_PATTERN, "Invalid username format.");

const schoolInviteRoles = [
  "school_admin",
  "coordinator",
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
  username,
  password: z.string().min(8).max(128),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

/** Domain join activates as teacher/staff/accountant/coordinator (admin may also choose school_admin). */
export const activateMemberSchema = z.object({
  requestId: z.string().uuid(),
  role: z.enum(["school_admin", "coordinator", "accountant", "teacher", "staff"]),
});

export type ActivateMemberInput = z.infer<typeof activateMemberSchema>;

export const schoolDomainSignUpSchema = z.object({
  email: z.string().email().max(320),
  fullName: z.string().trim().min(2).max(160),
  username,
  password: z.string().min(8).max(128),
});

export type SchoolDomainSignUpInput = z.infer<typeof schoolDomainSignUpSchema>;
