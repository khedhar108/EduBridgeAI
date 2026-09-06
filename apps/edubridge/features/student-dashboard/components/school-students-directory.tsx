"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  createColumnHelper,
  DataTable,
  DataTableColumnHeader,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@repo/ui/components/data-table";
import { formatDob } from "../lib/format-dob";
import { studentInitials } from "../lib/student-initials";
import type { DirectoryStudentRow } from "../types";

type Props = {
  workspace: string;
  students: DirectoryStudentRow[];
  empty?: string;
};

const columnHelper = createColumnHelper<DirectoryStudentRow>();

export function SchoolStudentsDirectory({ workspace, students, empty }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const pupil = row.original;
          return (
            <Link
              href={`/${workspace}/students/${pupil.id}`}
              className="flex min-w-0 items-center gap-3 text-foreground"
            >
              <Avatar size="sm" className="size-8">
                {pupil.photoUrl ? (
                  <AvatarImage src={pupil.photoUrl} alt="" />
                ) : null}
                <AvatarFallback>{studentInitials(pupil.fullName)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium underline-offset-4 hover:underline">
                  {pupil.fullName}
                </span>
                <span className="truncate tabular-nums text-muted-foreground">
                  {pupil.admissionNumber}
                </span>
              </span>
            </Link>
          );
        },
      }),
      columnHelper.accessor("classCaption", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Class" />
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("dateOfBirth", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Born" />
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatDob(getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("guardianName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Guardian" />
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() ?? "—"}</span>
        ),
      }),
    ],
    [workspace],
  );

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <DataTable
      table={table}
      empty={empty ?? "No students on roll yet."}
    />
  );
}
