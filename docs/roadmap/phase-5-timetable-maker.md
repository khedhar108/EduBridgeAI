# Phase 5 — Timetable Maker

> Connected module for schedule makers: a canvas to place teachers into class periods, a non-AI **clash parse loop** that blocks double-booking (same teacher, same day/period), Excel-style weekly/monthly export, timetable history, thin hours/load views, and a basic Homework Scheduler. AI assist and WhatsApp homework send come later on the same module.

## Goal

Ship Timetable Maker so designated staff can build a clash-free weekly grid from Phase 1 teachers/classes/assignments, see conflicts highlighted in red without AI, export Excel layouts for teachers, keep version history, and collect daily homework per class in one place.

## Final outcome (definition of done)

A schedule maker builds a weekly timetable on a canvas. If the same teacher is placed in two classes for the same day and period, a deterministic parse/validation loop flags those cells with a **red background** and the timetable cannot be published until cleared. Class double-booking is also flagged. Teachers get an Excel (or spreadsheet-compatible) export of their week; past published versions remain browsable. Teachers can post daily homework for a class; a class digest lists every subject’s homework for that day without chasing colleagues in chat.

## Scope

**In (MVP — manual first):**

- Period template per school (e.g. 9 periods/day; mark which are **standard** vs **activity/spare** — default idea: 7 teaching + 2 activity)
- Canvas editor: class × day × period cells; assign subject + teacher from Phase 1 assignments
- **Priority #1 — teacher clash parse loop (no AI):** on every placement and on “Validate/Publish”, scan the grid; if one teacher occupies two cells for the same `day + period`, mark both cells red and block publish
- Class clash: same class cannot have two subjects in the same `day + period` (also red)
- Views: by class, by teacher
- Publish + **history** (immutable published snapshots; draft editable)
- Excel export: weekly grid per class and per teacher; monthly = week sheets or repeated weeks for the month
- Thin load report: planned hours per teacher / per class from the published grid (graphs OK; paper-like premium light UI)
- **Homework Scheduler (basic):** teacher posts homework for `class + date + subject`; class digest aggregates all posts for that day (copy/export). No WhatsApp send in this phase

**Out (deferred — same module, later upscale):**

- AI canvas assist / personal instruction block / auto-reshape from marks + prior hours (needs Phase 2 patterns)
- WhatsApp send of homework digests (reuse Phase 2 channel)
- Full constraint solver (rooms/labs, 40+ soft constraints, FET-style)
- Substitutions / cover allocation
- Exam timetables
- Parent-facing homework completion tracking

## Prerequisites

- Phase 1 exit criteria met (`classes`, `subjects`, `teacher_assignments`, teachers as members)
- Phase 2 **not** required for MVP (clash loop is pure deterministic code)
- Phase 0 shell + feature folders

## Deliverables

1. `apps/edubridge/features/timetable/` — module per [feature-folder blueprint](../guides/feature-folder-structure.md), registered in the shell module registry
2. Migrations: period templates, timetable drafts/versions, slot assignments, homework posts (all `school_id` + RLS)
3. Shared clash validator (server + client highlight); publish path re-validates server-side
4. Excel export path (library choice recorded briefly in feature doc or ADR)
5. `docs/features/timetable/` feature doc

## Milestones

### 5.1 Period template + canvas shell

- `timetable_period_templates`: periods per day, labels, `kind: standard | activity`
- Working days config (Mon–Sat etc.) per school
- Empty canvas UI (class picker, week grid) using Phase 1 classes; premium light tokens ([MASTER.md](../design/MASTER.md))
- Roles: who may edit (admin + designated staff) vs view (teachers see own)

### 5.2 Placement + clash parse loop (MVP core)

- `timetable_drafts` + `timetable_slots` (draft_id, day, period_index, class_id, subject_id, teacher_id)
- Place/move/clear cells; restrict teacher/subject choices to Phase 1 assignments where practical
- **Parse loop (non-AI):** pure function over slots → `{ teacherClashes[], classClashes[] }`; run on edit debounce and on publish
- UI: clash cells get **red background**; optional sidebar list of conflicts with jump-to-cell
- Server rejects `publish` if any clash remains (never trust client)

### 5.3 Publish, history, Excel export

- Publish copies draft → immutable `timetable_versions` (+ slot snapshot)
- Browse/restore-as-new-draft from history (restore does not mutate past versions)
- Export Excel: class week + teacher week; monthly export as agreed in feature doc (multi-sheet OK)

### 5.4 Load view + Homework Scheduler (basic)

- Read-only hours chart/table from published version (teacher × class hours)
- `homework_posts` (school_id, class_id, subject_id, teacher_id, for_date, body); teacher creates for own assignments
- Class digest page/API for a date; copy text / CSV; no WhatsApp yet

## Data model touchpoints

New tables (names indicative): `timetable_period_templates`, `timetable_drafts`, `timetable_slots`, `timetable_versions`, `timetable_version_slots`, `homework_posts`.

Reads Phase 1 academic structure; does **not** invent parallel teacher/class tables. Optional later read of marks for AI upscale only.

## RBAC notes

| Action | school_admin | teacher | staff | student | parent |
|---|---|---|---|---|---|
| Manage period templates / publish timetable | ✅ | — | ✅ if designated | — | — |
| Edit draft canvas | ✅ | — | ✅ if designated | — | — |
| View published (own / assigned) | all | own schedule | assigned | own class (optional later) | — |
| Post homework | ✅ | ✅ own classes | — | — | — |
| View class homework digest | ✅ | ✅ assigned | ✅ if designated | — | — (later) |

## Standards

- **Clash detection is deterministic** — one shared validator; client highlights only; server is source of truth on publish.
- MVP success metric: **zero published teacher double-books** (same teacher, same day, same period).
- AI never writes tenant timetable rows directly — future assist drafts patches humans accept (agent-ecosystem rule).
- Multi-tenant: every table `school_id` + RLS; session tenant only.
- UI: light-only premium; paper-like grid; red = conflict only (don’t invent a dark theme).

## Testing checklist

- [ ] Same teacher in two classes, same day+period → both cells red; publish blocked
- [ ] Clearing one conflict cell clears red when parse re-runs
- [ ] Same class two subjects same day+period → red; publish blocked
- [ ] Activity/spare periods accept placement rules as configured (or stay empty)
- [ ] Published version immutable when draft changes afterwards
- [ ] Excel opens with correct teacher week and class week
- [ ] Homework from two teachers appears in one class digest for that date
- [ ] Cross-tenant isolation on all new tables (two-school test)
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- Pilot school publishes one clash-free weekly timetable and distributes Excel to teachers
- Clash parse loop covered by automated unit tests (fixture grids)
- Homework digest used for at least one class for one school day
- `docs/features/timetable/` written
- AI instruction-block / WhatsApp homework explicitly still deferred
