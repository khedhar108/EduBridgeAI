import { z } from "zod";

export const attendanceStatusSchema = z.enum(["present", "absent", "late"]);

export const recordAttendanceSchema = z.object({
  classId: z.string().uuid(),
  onDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: attendanceStatusSchema,
      }),
    )
    .min(1)
    .max(80),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;

export const recordClassActivitySchema = z.object({
  classId: z.string().uuid(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().trim().min(2).max(64),
  note: z.string().trim().min(2).max(4000),
});

export type RecordClassActivityInput = z.infer<typeof recordClassActivitySchema>;
