"use server";

import { revalidatePath } from "next/cache";
import { activities, withTenant } from "@repo/db";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { staffCanEnterClass } from "../queries/list-classes";
import { recordClassActivitySchema } from "../lib/schemas";

export type RecordClassActivityState = { error?: string; ok?: boolean };

export async function recordClassActivityAction(
  workspace: string,
  _prev: RecordClassActivityState,
  formData: FormData,
): Promise<RecordClassActivityState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  if (!can(ctx, "students.recordActivities")) {
    return { error: "You cannot post class events." };
  }

  const parsed = recordClassActivitySchema.safeParse({
    classId: formData.get("classId"),
    occurredOn: formData.get("occurredOn"),
    category: formData.get("category"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: "Add a category, note, and date for the class event." };
  }

  try {
    await withTenant(
      {
        sub: ctx.userId,
        school_id: ctx.schoolId,
        role: ctx.role,
      },
      async (tx) => {
        const allowed = await staffCanEnterClass(
          tx,
          ctx.schoolId,
          parsed.data.classId,
          ctx.userId,
          ctx.role,
        );
        if (!allowed) {
          throw new Error("This class is not assigned to you.");
        }

        await tx.insert(activities).values({
          schoolId: ctx.schoolId,
          classId: parsed.data.classId,
          studentId: null,
          category: parsed.data.category,
          note: parsed.data.note,
          occurredOn: parsed.data.occurredOn,
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
        });
      },
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not post the event.",
    };
  }

  revalidatePath(`/${workspace}/students`);
  return { ok: true };
}
