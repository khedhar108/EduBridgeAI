# 0036 — TanStack Query student attendance mutation

**Date:** 2026-09-04

## Goal

Add TanStack Query mutation for student attendance recording while keeping RSC first paint and Drizzle queries untouched.

## What changed

- Added `students` query keys to `apps/edubridge/lib/query/keys.ts`.
- Created `useRecordAttendance` hook in `apps/edubridge/features/student-dashboard/hooks/use-record-attendance.ts` using `useMutation` (`retry: 0`, query invalidation on success).
- Switched `AttendanceGrid` from `useActionState` to `useRecordAttendance` with `useActionToast`.
- Wrapped `AttendanceGrid` with `QueryIsland` in `SchoolStudentsPage`.
- Updated `tanstack-query-adoption.md` checklist.

## Commands

```bash
pnpm --filter edubridge check-types
pnpm --filter edubridge lint
```

## Key paths

- `apps/edubridge/lib/query/keys.ts`
- `apps/edubridge/features/student-dashboard/hooks/use-record-attendance.ts`
- `apps/edubridge/features/student-dashboard/components/attendance-grid.tsx`
- `apps/edubridge/features/student-dashboard/components/school-students-page.tsx`
- `apps/edubridge/features/student-dashboard/index.ts`
- `docs/guides/tanstack-query-adoption.md`

## Next

Fees or Control Hub mutations with TanStack Query after user review.
