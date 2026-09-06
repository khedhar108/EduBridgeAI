"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  createColumnHelper,
  DataTable,
  DataTableColumnHeader,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@repo/ui/components/data-table";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import type { RecordAttendanceState } from "../actions/record-attendance";
import { useRecordAttendance } from "../hooks/use-record-attendance";

const initial: RecordAttendanceState = {};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
] as const;

type Status = (typeof STATUS_OPTIONS)[number]["value"];

type RosterRow = {
  studentId: string;
  fullName: string;
  admissionNumber: string;
};

type Props = {
  workspace: string;
  schoolId?: string;
  userId?: string;
  classId: string;
  onDate: string;
  roster: RosterRow[];
  existing: { studentId: string; status: Status }[];
};

const columnHelper = createColumnHelper<RosterRow>();

export function AttendanceGrid({
  workspace,
  schoolId,
  userId,
  classId,
  onDate,
  roster,
  existing,
}: Props) {
  const { mutate, isPending, data: mutationResult } = useRecordAttendance(
    workspace,
    schoolId,
    userId,
  );
  useActionToast(mutationResult ?? initial, "Attendance saved.");

  const existingByStudent = useMemo(() => {
    const map = new Map<string, Status>();
    for (const row of existing) {
      map.set(row.studentId, row.status);
    }
    return map;
  }, [existing]);

  const [marks, setMarks] = useState<Record<string, Status>>(() => {
    const next: Record<string, Status> = {};
    for (const pupil of roster) {
      next[pupil.studentId] = existingByStudent.get(pupil.studentId) ?? "present";
    }
    return next;
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const recordsJson = JSON.stringify(
    roster.map((pupil) => ({
      studentId: pupil.studentId,
      status: marks[pupil.studentId] ?? "present",
    })),
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/${workspace}/students/${row.original.studentId}`}
            className="truncate font-medium text-foreground underline-offset-4 hover:underline"
          >
            {row.original.fullName}
          </Link>
        ),
      }),
      columnHelper.accessor("admissionNumber", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Admission" />
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "status",
        enableSorting: false,
        header: "Status",
        cell: ({ row }) => {
          const pupil = row.original;
          return (
            <>
              <label className="sr-only" htmlFor={`status-${pupil.studentId}`}>
                Attendance for {pupil.fullName}
              </label>
              <select
                id={`status-${pupil.studentId}`}
                value={marks[pupil.studentId] ?? "present"}
                disabled={isPending}
                onChange={(event) => {
                  const value = event.target.value as Status;
                  setMarks((curr) => ({ ...curr, [pupil.studentId]: value }));
                }}
                className="border-input bg-background h-11 w-full rounded-md border px-3 text-sm sm:w-40"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          );
        },
      }),
    ],
    [workspace, marks, isPending],
  );

  const table = useReactTable({
    data: roster,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.studentId,
  });

  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pupils are enrolled in this class yet.
      </p>
    );
  }

  return (
    <form
      action={(formData) => {
        mutate(formData);
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="onDate" value={onDate} />
      <input type="hidden" name="records" value={recordsJson} />

      <DataTable
        table={table}
        empty="No pupils are enrolled in this class yet."
      />

      <Button type="submit" disabled={isPending} className="h-11 w-fit">
        {isPending ? <Spinner className="size-4" /> : null}
        Save attendance
      </Button>
    </form>
  );
}
