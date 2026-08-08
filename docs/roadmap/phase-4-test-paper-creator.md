# Phase 4 — Test Paper Creator

> The third module: teachers build quizzes and test papers from templates and question banks, with AI-assisted generation, and export print-ready papers.

## Goal

Ship the Test Paper Creator module: reusable question banks per subject/class, template-driven paper assembly (sections, marks distribution), AI-assisted question generation via Mastra, and print/PDF export with a separate answer key.

## Final outcome (definition of done)

A teacher assembles a periodic-test paper for their class-subject in minutes: pick a template, pull questions from the bank (or generate candidates with AI and curate them), auto-check the marks total, and export a print-ready PDF plus answer key. Papers are private to staff — students and parents never see this module.

## Scope

**In:**

- Question banks: per subject + class level, typed questions (MCQ, short answer, long answer, fill-in-the-blank), difficulty, chapter/topic tags, marks
- Paper templates: sections (e.g. "Section A: 10 × 1 mark MCQ"), total marks, duration, general instructions
- Paper builder: assemble from bank, drag/reorder, live marks total validation, duplicate detection
- AI generation (Mastra workflow): generate candidate questions from topic/chapter + difficulty + type; teacher reviews and saves accepted ones into the bank (nothing AI-generated enters a paper without explicit acceptance)
- Export: question paper PDF + separate answer key PDF; school-branded header
- Reuse: papers cloneable across terms/years; bank shared within the school (not across tenants)

**Out (deferred):**

- Online test-taking / auto-grading by students (major separate module; papers here are for print/offline use)
- Cross-school shared question marketplaces
- OMR sheet generation
- Linking test results back to marks entry (teachers enter marks via Phase 1 as usual)

## Prerequisites

- Phase 1 exit criteria met (classes/subjects/teacher assignments exist)
- Phase 2 exit criteria met (agent service + workflow patterns available for AI generation)

## Deliverables

1. `apps/web/features/test-papers/` — the module, following the [feature-folder blueprint](../guides/feature-folder-structure.md), registered in `modules.ts`
2. Migrations: question bank + paper tables (tenant-scoped + RLS)
3. Mastra workflow: `generate-questions` in `apps/agent`
4. PDF export reusing the Phase 3 PDF pipeline
5. `docs/features/test-papers/` feature doc

## Milestones

### 4.1 Question bank

- Tables: `questions` (school_id, subject, class level, type, difficulty, topic tags, body richtext, options/answer payload as JSON, marks, `created_by`, `source: manual | ai`), `question_topics`.
- Bank UI: filterable list (subject, class, topic, difficulty, type), create/edit forms per question type, archive instead of delete (papers may reference old questions).

### 4.2 Templates and paper builder

- Tables: `paper_templates` (sections config, total marks, duration, instructions), `papers` (`status: draft | finalized`), `paper_questions` (section, order, marks override).
- Builder UX: pick template → fill sections from bank (filtered to match section constraints) → reorder → live total validation (sum must equal template total) → finalize.
- Finalized papers are immutable snapshots (question text copied at finalize time, like Phase 3 report cards).

### 4.3 AI-assisted generation

- Mastra workflow `generate-questions`: input `{ subject, classLevel, topics, type, difficulty, count }` → LLM generates candidates with answers → returned to a review tray in the builder.
- Teacher accepts/edits/rejects each candidate; accepted ones are saved to the bank marked `source: ai` with the accepting teacher as `created_by`.
- Guardrails: syllabus/topic-scoped prompts; duplicates against existing bank flagged (similarity check) before save.

### 4.4 Export and reuse

- Question paper PDF (school header, sections, marks per question) + separate answer key PDF.
- Clone paper (new draft from a finalized paper) for reuse next term/year.
- Paper library per teacher + school-wide view for admin.

## Data model touchpoints

New tables: `questions`, `question_topics`, `paper_templates`, `papers`, `paper_questions`. Reads Phase 1 `subjects`, `classes`, `teacher_assignments`. All tenant-scoped + RLS.

## RBAC notes

| Action | school_admin | teacher | staff | student | parent |
|---|---|---|---|---|---|
| Manage question bank | ✅ | ✅ own subjects | — | — | — |
| Create/finalize papers | ✅ | ✅ own class-subjects | — | — | — |
| View all school papers | ✅ | own only | — | — | — |
| AI generation | ✅ | ✅ | — | — | — |

The module does not appear in the shell menu for `staff`, `student`, `parent` (Phase 0 registry `allowedRoles`). Papers are exam-sensitive material: access logging on paper reads is on by default.

## Standards

- AI-generated content is always human-reviewed before persistence — no direct AI-to-paper path.
- Finalized papers immutable; question edits never mutate finalized papers.
- Question body stored as structured content (JSON), rendered consistently in builder and PDF.

## Testing checklist

- [ ] Marks-total validation blocks finalize when section sums mismatch
- [ ] Finalized paper unchanged after editing a source question in the bank
- [ ] AI candidates never enter the bank without explicit acceptance
- [ ] Teacher A cannot see teacher B's draft papers; admin sees all; cross-tenant isolation tested
- [ ] PDFs render all question types correctly, answer key separate
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- Pilot school conducts one real test using a paper produced by the module
- All testing checklist items pass
- `docs/features/test-papers/` written
