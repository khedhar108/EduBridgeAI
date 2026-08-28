import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { listClassWideActivities } from "../queries/activities";
import { listAttendanceForDate } from "../queries/attendance";
import {
  getClassById,
  listAccessibleClasses,
  listClassRoster,
} from "../queries/list-classes";
import { todayIst } from "../lib/today-ist";
import { AttendanceGrid } from "./attendance-grid";
import { ClassActivityForm } from "./class-activity-form";
import { ClassFilterForm } from "./class-filter-form";

type Props = {
  workspace: string;
  classId?: string;
  onDate?: string;
};

export async function SchoolStudentsPage({
  workspace,
  classId,
  onDate,
}: Props) {
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "students.view")) notFound();

  const date = onDate && /^\d{4}-\d{2}-\d{2}$/.test(onDate) ? onDate : todayIst();

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const accessible = await listAccessibleClasses(tx, ctx.schoolId);
      const selectedId =
        classId && accessible.some((row) => row.id === classId)
          ? classId
          : accessible[0]?.id;
      if (!selectedId) {
        return { kind: "empty" as const, accessible };
      }

      const selected = await getClassById(tx, ctx.schoolId, selectedId);
      if (!selected) {
        return { kind: "empty" as const, accessible };
      }
      const [roster, existing, events] = await Promise.all([
        listClassRoster(tx, ctx.schoolId, selectedId),
        listAttendanceForDate(tx, ctx.schoolId, selectedId, date),
        listClassWideActivities(tx, ctx.schoolId, selectedId),
      ]);

      return { kind: "ready" as const, accessible, selected, roster, existing, events };
    },
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          Pick a class, mark the day’s register, and post events the family hub
          will read for that child. Signed in as {ctx.role.replace(/_/g, " ")}.
        </p>
      </div>

      {data.kind === "empty" ? (
        <p className="text-sm text-muted-foreground">
          No class is assigned to you yet. A school admin needs to add the
          class and your teaching or staff assignment.
        </p>
      ) : (
        <>
          <ClassFilterForm
            workspace={workspace}
            classes={data.accessible}
            selectedClassId={data.selected.id}
            onDate={date}
          />

          <section className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="On roll"
              value={String(data.roster.length)}
            />
            <Stat
              label="Marked today"
              value={String(data.existing.length)}
            />
            <Stat
              label="Present"
              value={String(
                data.existing.filter((row) => row.status === "present").length,
              )}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              Attendance · {data.selected.name} {data.selected.section}
            </h2>
            <AttendanceGrid
              workspace={workspace}
              classId={data.selected.id}
              onDate={date}
              roster={data.roster}
              existing={data.existing}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Class events</h2>
            <p className="text-sm text-muted-foreground">
              Class-wide notes appear on the family Events page for every child
              in this class. Marks entry comes next.
            </p>
            <ClassActivityForm
              workspace={workspace}
              classId={data.selected.id}
              occurredOn={date}
            />
            {data.events.length > 0 ? (
              <ul className="divide-y divide-border rounded-md border border-border">
                {data.events.map((event) => (
                  <li key={event.id} className="flex flex-col gap-1 px-4 py-3">
                    <p className="text-sm font-medium">
                      {event.category}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {event.occurredOn}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{event.note}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
