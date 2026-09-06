import { z } from "zod";
import { INDIA_STATES } from "./india-states";

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$/;

export const registerSchoolSchema = z.object({
  schoolName: z.string().trim().min(2).max(160),
  country: z.literal("IN"),
  state: z
    .string()
    .refine((value): value is (typeof INDIA_STATES)[number] =>
      (INDIA_STATES as readonly string[]).includes(value),
    ),
  city: z.string().trim().min(2).max(80),
  pincode: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{6}$/.test(value), {
      message: "PIN must be 6 digits.",
    }),
  fullName: z.string().trim().min(2).max(160),
  email: z.string().email().max(320),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(32)
    .regex(USERNAME_PATTERN, "Use lowercase letters, numbers, dots, dashes or underscores."),
  password: z.string().min(8).max(128),
  passwordConfirm: z.string().min(8).max(128),
  slug: z.string().trim().toLowerCase().min(10).max(120),
});

export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>;

export const verifyRegisterOtpSchema = z.object({
  email: z.string().email().max(320),
  token: z.string().trim().min(6).max(8),
});

export const resendRegisterOtpSchema = z.object({
  email: z.string().email().max(320),
});
