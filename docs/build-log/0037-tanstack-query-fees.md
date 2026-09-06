# 0037 — TanStack Query fees mutations

**Date:** 2026-09-04

## Goal

Wire TanStack Query mutations for fee payment and student registration. RSC first paint, Drizzle queries, and money/idempotency stay unchanged.

## What changed

- Added `fees.all` query keys scoped by school + user.
- Created `useRecordPayment` and `useRegisterStudent` (`retry: 0`, invalidate fees keys; register also invalidates students).
- Switched payment and register forms from `useActionState` to those hooks, wrapped in `QueryIsland`.
- Passed `schoolId` / `userId` from the RSC pages.

## Commands

```bash
pnpm --filter edubridge check-types
pnpm --filter edubridge exec eslint features/fees/hooks/use-record-payment.ts features/fees/hooks/use-register-student.ts features/fees/components/record-payment-form.tsx features/fees/components/register-student-form.tsx lib/query/keys.ts
```

## Key paths

- `apps/edubridge/lib/query/keys.ts`
- `apps/edubridge/features/fees/hooks/use-record-payment.ts`
- `apps/edubridge/features/fees/hooks/use-register-student.ts`
- `apps/edubridge/features/fees/components/record-payment-form.tsx`
- `apps/edubridge/features/fees/components/register-student-form.tsx`
- `apps/edubridge/app/[workspace]/(staff)/fees/register/page.tsx`
- `apps/edubridge/app/[workspace]/(staff)/fees/collections/page.tsx`

## Next

Control Hub mutation after user review.
