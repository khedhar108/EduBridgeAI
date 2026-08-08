# Phase 2 — AI Integration

> Turn recorded data into delivered value: Mastra multi-step workflows that summarize student dashboards and share them to parents over WhatsApp on request.

## Goal

Wire `apps/agent` (Mastra) into the platform as the single AI service, ship the first two workflows — report summarization and WhatsApp report delivery — and surface AI insight cards inside the Student Dashboard.

## Final outcome (definition of done)

A teacher or parent taps "Share report" on a student dashboard; a Mastra workflow gathers that student's tenant-scoped data, generates a parent-friendly summary, and delivers it to the parent's WhatsApp. The `share_requests` row created in Phase 1 tracks the full lifecycle (`pending → processing → delivered / failed`). The dashboard shows an AI-generated insight card per student.

## Scope

**In:**

- Mastra service hardening in `apps/agent`: tenant-aware tools, typed client for `apps/web`
- Workflow 1 — **Student report summarization**: dashboard data → structured summary (strengths, attention areas, attendance note)
- Workflow 2 — **WhatsApp delivery**: summary → formatted message → WhatsApp Business API send → status tracking
- Share-request processing (consumes the Phase 1 `share_requests` table + button)
- AI insight card on the student dashboard (cached, regenerated on data change)
- Provider selection ADR: WhatsApp (Meta Cloud API vs. Twilio vs. aggregator) and LLM provider/model
- Opt-in consent: parent phone verified + consented before any WhatsApp send

**Out (deferred):**

- Report card commentary → Phase 3
- Test paper generation → Phase 4
- Chat interface / free-form Q&A over school data (future, uses `packages/ai-ui`)
- Automatic (unrequested) push notifications — everything in this phase is request-triggered

## Prerequisites

- Phase 1 exit criteria met (real data exists; `share_requests` table live)
- WhatsApp Business API account approved (start this early — approval takes time)
- LLM API key provisioned for `apps/agent`

## Deliverables

1. Workflows + tools in `apps/agent/src/` (Mastra workflow definitions)
2. Typed client in `apps/web/lib/agent-client.ts` (uses `@mastra/client-js`)
3. WhatsApp provider adapter in `apps/agent` (single interface so the provider can be swapped)
4. `docs/decisions/ADR-00X-whatsapp-provider.md` and `docs/decisions/ADR-00X-llm-provider.md`
5. `docs/features/ai-report-sharing/` feature doc

## Milestones

### 2.1 Agent service foundation

- Tenant-context contract: every workflow invocation carries `{ schoolId, requestedBy, role }`, validated server-side in `apps/web` before calling the agent — the agent never receives raw client input.
- Data-access tools for Mastra query via Drizzle under `withTenant` claims (same pattern as web server actions) — retrieval architecture, SQL-vs-RAG split, and pgvector setup: [ai-rag.md](../architecture/ai-rag.md).
- Set up RAG infrastructure: enable pgvector in Supabase, create the vector index (HNSW), ingestion workflow for activity notes with `school_id` metadata (Phase 3/4 depend on this).
- Health check + local dev flow: `pnpm dev:web+agent`.

### 2.2 Summarization workflow

- Steps: fetch student profile + attendance + marks + activities (window: current term) → compute simple stats → LLM generates structured summary (JSON: `strengths[]`, `attention_areas[]`, `attendance_note`, `overall`) → store in `student_summaries` (tenant-scoped, with input-data hash).
- Regeneration only when underlying data changed (hash comparison) — keeps cost down and queries deterministic.
- Tone/length guardrails in the prompt; no invented data (the prompt only receives real numbers).

### 2.3 WhatsApp delivery workflow

- Consent first: `parent_contacts` table (phone, verified, whatsapp_opt_in). Admin/parent verifies phone before any send.
- Steps: pick up `pending` share request → run/reuse summarization → render message template (school name, student, period, summary, "sent via EduBridge") → send via provider adapter → update `share_requests.status` + provider message id → record delivery webhook callbacks.
- Failure handling: retry transient failures (bounded), mark `failed` with reason otherwise; teacher/admin sees status on the dashboard.

### 2.4 Dashboard integration

- "Share report" button now live: creates request, shows live status (pending/processing/delivered/failed).
- AI insight card on the student dashboard renders the latest `student_summaries` row; roles see it per the Phase 1 visibility matrix.
- Admin view: log of shares (who requested, for which student, status) — this is also the audit trail.

## Data model touchpoints

New tables: `student_summaries`, `parent_contacts`, `share_deliveries` (or extend `share_requests`). All tenant-scoped + RLS. No changes to Phase 1 tables.

## RBAC notes

- Request a share: `school_admin`, `teacher` (own classes), `parent` (own children — sends to self).
- View share log: `school_admin`; teachers see their own requests.
- The agent service itself has no user session — authorization is fully decided in `apps/web` before invoking a workflow; the agent trusts only the validated context object.

## Standards

- All AI logic in `apps/agent`; `apps/web` never calls an LLM directly.
- Every workflow is multi-step (fetch → analyze → generate → deliver) with each step observable in Mastra traces.
- Prompts live in versioned files in the repo, not inline strings.
- Cost guardrail: summaries cached by data hash; delivery template messages preferred over free-form where WhatsApp policy requires.

## Testing checklist

- [ ] Workflow refuses to run without a valid tenant context; tools never return cross-tenant rows (test with two schools)
- [ ] Summary regenerates only when data changed
- [ ] WhatsApp send works end-to-end on a sandbox/test number, including delivery-status webhook
- [ ] Unverified/non-consenting parent phone is never sent a message
- [ ] Failed deliveries surface a clear status and reason in the UI
- [ ] `pnpm build`, `pnpm lint`, `pnpm check-types` green

## Exit criteria

- Real report delivered to a real parent's WhatsApp at the pilot school
- Both ADRs merged; provider adapters documented
- Insight cards live on dashboards
- Summarization workflow reusable as a building block (Phase 3 commentary will call into the same patterns)
