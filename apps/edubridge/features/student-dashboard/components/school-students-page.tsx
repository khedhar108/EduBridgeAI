import Link from "next/link";
import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { parseDirectoryListInput, studentsPageHref } from "../lib/directory-list-query";
import { listClassWideActivities } from "../queries/activities";
import { listAttendanceForDate } from "../queries/attendance";
import { listDirectoryStudents } from "../queries/list-directory-students";
import {
  getClassById,
  listAccessibleClasses,
  listClassRoster,
} from "../queries/list-classes";
import { todayIst } from "../lib/today-ist";
import { QueryIsland } from "@/lib/query/island";
import { AttendanceGrid } from "./attendance-grid";
import { ClassActivityForm } from "./class-activity-form";
import { ClassFilterForm } from "./class-filter-form";
import { SchoolStudentsDirectory } from "./school-students-directory";

type Props = {
  workspace: string;
  classId?: string;
  onDate?: string;
  nameQuery?: string;
  page?: string;
};

export async function SchoolStudentsPage({
  workspace,
  classId,
  onDate,
  nameQuery,
  page: pageParam,
}: Props) {
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "students.view")) notFound();

  const date = onDate && /^\d{4}-\d{2}-\d{2}$/.test(onDate) ? onDate : todayIst();
  const listInput = parseDirectoryListInput({ q: nameQuery, page: pageParam });

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const [accessible, directory] = await Promise.all([
        listAccessibleClasses(tx, ctx.schoolId),
        listDirectoryStudents(
          tx,
          ctx.schoolId,
          ctx.userId,
          ctx.role,
          listInput,
        ),
      ]);
      const selectedId =
        classId && accessible.some((row) => row.id === classId)
          ? classId
          : accessible[0]?.id;
      if (!selectedId) {
        return { kind: "empty" as const, accessible, directory };
      }

      const selected = await getClassById(tx, ctx.schoolId, selectedId);
      if (!selected) {
        return { kind: "empty" as const, accessible, directory };
      }
      const [roster, existing, events] = await Promise.all([
        listClassRoster(tx, ctx.schoolId, selectedId),
        listAttendanceForDate(tx, ctx.schoolId, selectedId, date),
        listClassWideActivities(tx, ctx.schoolId, selectedId),
      ]);

      return {
        kind: "ready" as const,
        accessible,
        directory,
        selected,
        roster,
        existing,
        events,
      };
    },
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          Open a child for their record. Mark the day’s register for a class
          below. Signed in as {ctx.role.replace(/_/g, " ")}.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">On roll</h2>
        <form
          method="get"
          action={`/${workspace}/students`}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          {data.kind === "ready" ? (
            <input type="hidden" name="class" value={data.selected.id} />
          ) : classId ? (
            <input type="hidden" name="class" value={classId} />
          ) : null}
          <input type="hidden" name="date" value={date} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="q" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="q"
              name="q"
              type="search"
              defaultValue={listInput.name ?? ""}
              placeholder="Find a child"
              className="h-11"
            />
          </div>
          <Button type="submit" variant="secondary" className="h-11">
            Find
          </Button>
        </form>
        <SchoolStudentsDirectory
          workspace={workspace}
          students={data.directory.rows}
          empty={
            listInput.name
              ? "No child with that name."
              : "No students on roll yet."
          }
        />
        <DirectoryPager
          workspace={workspace}
          classId={data.kind === "ready" ? data.selected.id : classId}
          date={date}
          q={listInput.name}
          page={data.directory.page}
          pageSize={data.directory.pageSize}
          total={data.directory.total}
        />
      </section>

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
            nameQuery={listInput.name}
          />

          <section className="grid gap-4 sm:grid-cols-3">
            <Stat label="Class roll" value={String(data.roster.length)} />
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
            <QueryIsland>
              <AttendanceGrid
                workspace={workspace}
                schoolId={ctx.schoolId}
                userId={ctx.userId}
                classId={data.selected.id}
                onDate={date}
                roster={data.roster}
                existing={data.existing}
              />
            </QueryIsland>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Class events</h2>
            <p className="text-sm text-muted-foreground">
              Class-wide notes appear on the family Events page for every child
              in this class. Marks entry comes next.
            </p>
            <ClassActivityForm
              workspace={workspace}
              schoolId={ctx.schoolId}
              userId={ctx.userId}
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

function DirectoryPager({
  workspace,
  classId,
  date,
  q,
  page,
  pageSize,
  total,
}: {
  workspace: string;
  classId?: string;
  date: string;
  q?: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  if (total <= pageSize) return null;
  const lastPage = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const href = (nextPage: number) =>
    studentsPageHref(workspace, {
      class: classId,
      date,
      q,
      page: nextPage,
    });

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <p className="tabular-nums text-muted-foreground">
        {from}–{to} of {total}
      </p>
      <div className="flex gap-3">
        {page > 1 ? (
          <Link href={href(page - 1)} className="underline-offset-4 hover:underline">
            Previous
          </Link>
        ) : null}
        {page < lastPage ? (
          <Link href={href(page + 1)} className="underline-offset-4 hover:underline">
            Next
          </Link>
        ) : null}
      </div>
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
