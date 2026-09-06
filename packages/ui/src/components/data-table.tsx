"use client"

import * as React from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
  type Table,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { Button } from "@repo/ui/components/button"
import {
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import { cn } from "@repo/ui/lib/utils"

function DataTable<TData>({
  table,
  empty,
  className,
}: {
  table: Table<TData>
  empty?: React.ReactNode
  className?: string
}) {
  const colCount = table.getVisibleLeafColumns().length
  const rows = table.getRowModel().rows

  return (
    <div className={cn("rounded-md border border-border", className)}>
      <TablePrimitive>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-muted-foreground"
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : header.column.getCanSort()
                            ? "none"
                            : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={colCount}
                className="h-24 whitespace-normal text-center text-muted-foreground"
              >
                {empty ?? "Nothing to show."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TablePrimitive>
    </div>
  )
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8", className)}
      aria-label={`Sort by ${title}`}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {sorted === "desc" ? (
        <ArrowDown className="size-3.5 text-muted-foreground" aria-hidden />
      ) : sorted === "asc" ? (
        <ArrowUp className="size-3.5 text-muted-foreground" aria-hidden />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden />
      )}
      <span className="sr-only">
        {sorted === "asc"
          ? "Sorted ascending"
          : sorted === "desc"
            ? "Sorted descending"
            : "Not sorted"}
      </span>
    </Button>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
}

export type { ColumnDef, SortingState, Table }
