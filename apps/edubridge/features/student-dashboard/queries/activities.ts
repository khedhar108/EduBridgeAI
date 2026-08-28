import {
  activities,
  and,
  desc,
  eq,
  isNull,
  type TenantTx,
} from "@repo/db";

export type ClassActivityRow = {
  id: string;
  category: string;
  note: string;
  occurredOn: string;
};

export async function listClassWideActivities(
  tx: TenantTx,
  schoolId: string,
  classId: string,
): Promise<ClassActivityRow[]> {
  const rows = await tx
    .select({
      id: activities.id,
      category: activities.category,
      note: activities.note,
      occurredOn: activities.occurredOn,
    })
    .from(activities)
    .where(
      and(
        eq(activities.schoolId, schoolId),
        eq(activities.classId, classId),
        isNull(activities.studentId),
      ),
    )
    .orderBy(desc(activities.occurredOn))
    .limit(8);

  return rows;
}
