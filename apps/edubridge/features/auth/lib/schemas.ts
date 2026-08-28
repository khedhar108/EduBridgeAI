import { z } from "zod";
import { USERNAME_PATTERN } from "./username";

export const signInSchema = z.object({
  /** Accepts an email or a username; the action resolves usernames to emails. */
  email: z.string().min(2).max(320),
  password: z.string().min(8).max(128),
});

export const familySignInSchema = z.object({
  admissionNumber: z.string().trim().min(1).max(64),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date."),
  viewer: z.enum(["student", "parent"]),
});

export type FamilySignInInput = z.infer<typeof familySignInSchema>;

export const familyAddChildSchema = z.object({
  admissionNumber: z.string().trim().min(1).max(64),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date."),
});

export type FamilyAddChildInput = z.infer<typeof familyAddChildSchema>;

export const familySwitchChildSchema = z.object({
  studentId: z.string().uuid(),
});

export type FamilySwitchChildInput = z.infer<typeof familySwitchChildSchema>;

export type SignInInput = z.infer<typeof signInSchema>;

const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters.")
  .max(64)
  .regex(USERNAME_PATTERN, "Invalid username format.");

export const grantableRoles = [
  "coordinator",
  "accountant",
  "teacher",
  "staff",
  "student",
  "parent",
] as const;

export type GrantableRole = (typeof grantableRoles)[number];

/** Office-created staff accounts. Not student/parent (family door) or school_admin. */
export const provisionRoles = [
  "coordinator",
  "accountant",
  "teacher",
  "staff",
] as const;

export type ProvisionRole = (typeof provisionRoles)[number];

export const provisionMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().email().max(320),
  username,
  password: z.string().min(8).max(128),
  passwordConfirm: z.string().min(8).max(128),
  role: z.enum(provisionRoles),
});

export type ProvisionMemberInput = z.infer<typeof provisionMemberSchema>;

export const resetMemberPasswordSchema = z.object({
  targetUserId: z.string().uuid(),
  password: z.string().min(8).max(128),
  passwordConfirm: z.string().min(8).max(128),
});

export type ResetMemberPasswordInput = z.infer<typeof resetMemberPasswordSchema>;

/** Domain join: never school_admin — one admin per workspace (seed / school create). */
export const activateMemberSchema = z.object({
  requestId: z.string().uuid(),
  role: z.enum(["coordinator", "accountant", "teacher", "staff"]),
});

export type ActivateMemberInput = z.infer<typeof activateMemberSchema>;

export const changeMemberRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  role: z.enum(grantableRoles),
});

export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;

export const schoolDomainSignUpSchema = z.object({
  email: z.string().email().max(320),
  fullName: z.string().trim().min(2).max(160),
  username,
  password: z.string().min(8).max(128),
});

export type SchoolDomainSignUpInput = z.infer<typeof schoolDomainSignUpSchema>;
