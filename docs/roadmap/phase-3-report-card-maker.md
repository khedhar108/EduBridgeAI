# Phase 3 — Report Card Maker

> The second module: turn the marks and attendance already recorded in the Student Dashboard into official report cards — periodic tests, half-yearly, and annual — with a draft/approve flow and PDF export.

## Goal

Ship the Report Card Maker module: template-driven report cards computed from Phase 1 data, a teacher-drafts / admin-approves workflow, and printable PDF output per student or per class.

## Final outcome (definition of done)

For a chosen assessment period (periodic test, half-yearly, annual), a teacher generates draft report cards for their class in one action; the admin reviews and publishes them; parents and students see published cards in their dashboard and can download the PDF. Grades and totals are computed by the system, never hand-entered twice.

## Scope

**In:**

- Report card templates: school-configurable layout (header/logo, grading scheme, subject rows, attendance, remarks, signatures)
- Term/period definitions mapping onto Phase 1 `assessments` (which assessments count toward which report)
- Grade computation: totals, percentages, grade bands (configurable scheme, e.g. A1–E per CBSE-style bands)
- Draft → review → publish workflow with role separation
- Remarks: manual teacher remarks, optionally AI-suggested (reusing Phase 2 summarization patterns)
- PDF generation (per student + batch per class), on-brand for the school
- Published cards visible to parent/student in their dashboard views

**Out (deferred):**

- Co-scholastic/skill grading beyond a simple configurable section (extend later per pilot feedback)
- Direct WhatsApp delivery of report cards (compose with Phase 2 sharing after publish — enhancement, not core)
- Historical import of pre-EduBridge report cards

## Prerequisites

- Phase 1 exit criteria met (`assessments`, `marks`, `attendance_records` populated and stable)
- Phase 2 optional: needed only for AI-suggested remarks; the module must work without it

## Deliverables

1. `apps/web/features/report-cards/` — the module, following the [feature-folder blueprint](../guides/feature-folder-structure.md), registered in `modules.ts`
2. Migrations: templates, periods, report card + line tables (tenant-scoped + RLS)
3. PDF pipeline (server-side render; library choice recorded as ADR)
4. `docs/features/report-cards/` feature doc

## Milestones

### 3.1 Templates and grading schemes

- `report_templates`: layout config (sections, school branding) per school; ship one good default.
- `grading_schemes`: band definitions (min %, label) + rounding rules; per school, versioned so past cards never change retroactively.
- `report_periods`: name (Periodic Test 1, Half-Yearly, Annual), academic year, and the set of Phase 1 `assessments` included.
- Admin UI to manage all three.

### 3.2 Generation and computation

- "Generate drafts" action per class + period: system computes per-subject totals, percentage, grade, attendance %, rank (optional/toggleable).
- `report_cards` (one per student per period, `status: draft | in_review | published`) + `report_card_lines` (per subject: marks, max, grade).
- Regeneration allowed only in `draft`; published cards are immutable snapshots (store computed values, don't recompute on read).

### 3.3 Review and publish workflow

- Teacher: generates drafts for own classes, edits remarks, submits for review.
- Admin: reviews (diff against raw marks visible), requests changes or publishes (per student or whole class).
- Publish is atomic per class batch; audit trail of who published when.
- Optional AI remark suggestions (Phase 2 available): teacher always edits/accepts explicitly — never auto-filled into a published card.

### 3.4 Output and distribution

- PDF per student + merged class batch; layout driven by the template; school logo/branding from `schools`.
- Published cards appear in student/parent dashboard ("Report Cards" section) with download.
- Hook for Phase 2: "Share to WhatsApp" on a published card creates a standard share request.

## Data model touchpoints

New tables: `report_templates`, `grading_schemes`, `report_periods`, `report_period_assessments`, `report_cards`, `report_card_lines`. Reads Phase 1 `marks`, `assessments`, `attendance_records`; never writes them.

## RBAC notes

| Action | school_admin | teacher | staff | student | parent |
|---|---|---|---|---|---|
| Manage templates/schemes/periods | ✅ | — | — | — | — |
| Generate/edit drafts | ✅ | ✅ own classes | — | — | — |
| Publish | ✅ | — | — | — | — |
| View published cards | all | own classes | — | self | linked children |

## Standards

- Published report cards are immutable snapshots — corrections happen by unpublishing (admin, audited) and regenerating.
- All computation server-side with unit tests per grading scheme; the client never computes a grade.
- PDF rendering is a server concern (route handler or agent-side job), not client-side printing hacks.

## Testing checklist

- [ ] Grade band computation unit-tested across boundaries and rounding rules
- [ ] Draft regeneration reflects corrected marks; published cards do not change when marks change afterwards
- [ ] Teacher cannot publish; parent/student see only published cards for themselves
- [ ] PDF renders correctly for 1 student and a full class batch (including long names/many subjects)
- [ ] Cross-tenant isolation on all new tables (two-school test)
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- Pilot school publishes real report cards for one period end-to-end
- All testing checklist items pass
- `docs/features/report-cards/` written
- Share-to-WhatsApp hook functional if Phase 2 is live
