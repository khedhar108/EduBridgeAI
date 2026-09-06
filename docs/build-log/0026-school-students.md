# 0026 — School students dashboard (Slice 3)

**Date:** 2026-08-28

## Goal

Staff open `/{slug}/students`, pick a class, and mark attendance. Family Progress / Exams / Events read those tables for the active child.

## What changed

- `0010_academic-structure` migrated (classes, enrollments, attendance, assessments, marks, activities, share_requests + `private.can_access_class`).
- Did not apply any `drop-invitations` migration; schema barrel keeps `invitations`.
- Seed writes classes, subjects, offerings, enrollments; Pilot Teacher → Class 6; Pilot Staff → Class 7.
- Staff Students nav + attendance grid + class-wide events + pupil drill-in. Family hub fills stay honest-empty until staff record.
- Marks entry, admin structure CRUD, charts, PWA, `share_requests` button still open.

## Commands

```bash
pnpm db:migrate
pnpm db:check
pnpm seed:dev
pnpm --filter edubridge check-types
```

## Key paths

- `packages/db/src/schema/academic.ts`
- `apps/edubridge/app/[workspace]/(staff)/students/page.tsx`
- `apps/edubridge/features/student-dashboard/components/attendance-grid.tsx`
- `apps/edubridge/features/student-dashboard/queries/get-family-academic.ts`

## Next

Marks entry on `/students`, then admin class/subject CRUD. Family charts wait on marks.
