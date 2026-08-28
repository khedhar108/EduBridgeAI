"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  recordAttendanceAction,
  type RecordAttendanceState,
} from "../actions/record-attendance";

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
  classId: string;
  onDate: string;
  roster: RosterRow[];
  existing: { studentId: string; status: Status }[];
};

export function AttendanceGrid({
  workspace,
  classId,
  onDate,
  roster,
  existing,
}: Props) {
  const bound = recordAttendanceAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);
  useActionToast(state, "Attendance saved.");

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

  const recordsJson = JSON.stringify(
    roster.map((pupil) => ({
      studentId: pupil.studentId,
      status: marks[pupil.studentId] ?? "present",
    })),
  );

  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pupils are enrolled in this class yet.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="onDate" value={onDate} />
      <input type="hidden" name="records" value={recordsJson} />

      <ul className="divide-y divide-border rounded-md border border-border">
        {roster.map((pupil) => (
          <li
            key={pupil.studentId}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-col">
              <Link
                href={`/${workspace}/students/${pupil.studentId}`}
                className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {pupil.fullName}
              </Link>
              <span className="text-xs text-muted-foreground">
                {pupil.admissionNumber}
              </span>
            </div>
            <label className="sr-only" htmlFor={`status-${pupil.studentId}`}>
              Attendance for {pupil.fullName}
            </label>
            <select
              id={`status-${pupil.studentId}`}
              value={marks[pupil.studentId] ?? "present"}
              disabled={pending}
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
          </li>
        ))}
      </ul>

      <Button type="submit" disabled={pending} className="h-11 w-fit">
        {pending ? <Spinner className="size-4" /> : null}
        Save attendance
      </Button>
    </form>
  );
}
