import { z } from "zod";

const feeHeadSchema = z.object({
  code: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(120),
  amountInr: z.coerce.number().int().min(0),
});

export const publishFeePlanSchema = z.object({
  planId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  classLabel: z.string().trim().max(64).optional().or(z.literal("")),
  paymentMode: z.enum(["once", "quarterly", "custom"]),
  headsJson: z.string().min(2),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const registerStudentSchema = z.object({
  admissionNumber: z.string().trim().min(1).max(64),
  fullName: z.string().trim().min(2).max(160),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classLabel: z.string().trim().max(64).optional().or(z.literal("")),
  guardianName: z.string().trim().min(2).max(160),
  guardianRelationship: z.string().trim().min(1).max(64),
  guardianPhone: z.string().trim().max(32).optional().or(z.literal("")),
  planVersionId: z.string().uuid(),
  concessionPercent: z.coerce.number().int().min(0).max(100).default(0),
  concessionNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export const recordPaymentSchema = z.object({
  assignmentId: z.string().uuid(),
  amountInr: z.coerce.number().int().positive(),
  method: z.enum(["cash", "upi", "bank_transfer", "cheque", "other"]),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export { feeHeadSchema };
export type FeeHeadInput = z.infer<typeof feeHeadSchema>;
