---
name: edubridge-erp-landscape
description: >
  Competitive landscape of school ERP/SIS platforms (Fedena, Entab CampusCare,
  PowerSchool, MyClassCampus + India market context) as a strategy reference for
  EduBridge. Use when designing product strategy, module priorities, roadmap scope,
  pricing/positioning, or feature comparisons — or when the user mentions Fedena,
  Entab, CampusCare, PowerSchool, MyClassCampus, "competitors", "what do other
  platforms do", "market research", or asks how an existing ERP handles a workflow.
---

# EduBridge ERP Landscape & Strategy Reference

What incumbents ship, how they sell it, and what EduBridge should (and should not)
copy. Canonical context: `docs/roadmap/README.md` (active phase — never let
competitive FOMO pull future-phase work in), `docs/design/MASTER.md`,
`AGENTS.md` rules 3–6 (tenancy, data access, AI boundaries).

## How to use this skill

1. Name the decision: module priority, pricing, positioning, or a specific workflow design.
2. Read the competitor profiles + matrix below for how that problem is solved today.
3. Apply the heuristics in "Approach" — differentiate on depth × UX × AI × trust,
   never by cloning module lists.
4. Check the active phase file before proposing anything new.
5. Prices/features drift — before any claim reaches marketing or a sales doc,
   re-verify on the vendor's live site. Numbers here are directional (researched 2025–26).

---

## Competitor profiles

### Fedena (Foradian Technologies, Bengaluru)

**What:** All-in-one web ERP claiming 100+ modules — admissions, fees, exams/gradebook,
timetable, attendance, HR/payroll, transport, library, hostel, bulk data tools.
Multi-school support, API playground, ~20 integrations (biometric, GPS, payment
gateways, Zoom/Meet/BigBlueButton).

**How it sells:** Tiered annual licences (Standard/Premium/Ultimate ≈ $999/$1399/$1699;
India pricing from ~₹40k+/yr to ₹1L+ with setup fees) + unlimited users, but modules
are split across tiers so upgrades mean paying again. Reseller/partner program drives
distribution. Open-source heritage (Project Fedena) built early mindshare.

**Strengths:** Breadth, brand recognition, global footprint (200 countries, 20+ languages),
board alignment (CBSE/ICSE/IB/state).

**Weaknesses:** Dated UX, per-tier module upsells, English-first parent experience,
legacy monolith architecture, support treated as ticket queue.

**Steal:** Unlimited-users pricing (charge per institution, not per seat).
Multi-school as first-class concept.
**Avoid:** Module-count arms race; tier-gating core workflows.

### Entab CampusCare / CampusCare 10x (Entab Infotech, Delhi, since 2000)

**What:** Full school ERP + SIS for Indian K-12: admissions, fee/accounting, CBSE-aligned
exam management with rubric-based evaluation and auto-generated Holistic Progress Cards,
attendance, GPS transport, HR/payroll, inventory/library, stakeholder portals
(parent/staff/principal/management). Native iOS/Android apps ("CampusCare 10x").
~2,000–2,500 schools, 26 states. Markets itself explicitly as "Built for NEP 2020".

**How it sells:** Quote-gated per-student annual subscription (industry band roughly
₹100–500/student/yr depending on tier/modules), demo-first sales, implementation +
data migration + training services. AWS-hosted, Microsoft Gold Partner branding.

**Strengths:** Deep India/board-specific compliance templates (CBSE/ICSE/state),
strong fee workflows, 25-year trust with established private schools, mobile-first parents.

**Weaknesses:** Opaque pricing, enterprise deployment cycles, narrow third-party
ecosystem, legacy feel; NEP features are template bolt-ons rather than native data model.

**Steal:** Board-specific report-card/HPC generation as the demo centerpiece;
stakeholder-segmented portals; compliance language in positioning.
**Avoid:** Quote-only pricing; slow onboarding as the default experience.

### PowerSchool (global, US-based market leader)

**What:** The North-American K-12 platform company: SIS (configurable data model —
custom fields/pages/tables without vendor help), PowerTeacher Pro gradebook,
Schoology LMS, Enrollment/Enrollment Express, SchoolMessenger comms, Special Programs,
Unified Insights analytics, state/province compliance reporting engines.

**How it sells/wins:** District-scale enterprise contracts; consolidation via
acquisition into one "Connected Operating System"; interoperability standards
(OneRoster, Ed-Fi, LTI) plus a huge user community as switching moat.

**Relevance to EduBridge:** Not a price-band competitor in India — it is the
architectural north star: SIS as system of record, open APIs, ecosystem thinking,
compliance reporting as a product surface. Study its *structure*, not its feature list.
PowerBitty-style modular expansion shows where Indian SaaS ERPs will go next.

**Steal:** Configurable-without-code data model; standards-based interoperability;
treating regulatory reporting (UDISE+/APAAR equivalents) as a first-class module.
**Avoid:** Acquisition-led sprawl; enterprise sales motion for an SMB-first market.

### MyClassCampus (Hexagon Innovations, Ahmedabad, 2015)

**What:** Mobile-app-first cloud ERP, 40+ modules: fees/finance with passbook, exams +
offline paper generator, question banks, timetable, HRMS/payroll, library, hostel/mess,
gate pass, inventory, inquiry CRM, student wallet, QR attendance, GPS/biometric hardware
integration, SMS gateway, DIY website builder. Multi-branch under single credentials.
Languages incl. Hindi/Gujarati/Arabic. Serves schools, colleges, coaching institutes.

**How it sells:** Cheapest credible tier — ~₹100–150/student/yr across Basic/Advance/
Premium packages, free trial, quick setup, dedicated support team pitch.

**Strengths:** Affordability, mobility, fast onboarding, multi-segment reach
(schools → coaching), regional languages.

**Weaknesses:** Thin academic/compliance depth vs Entab/Fedena, smaller brand and
scale, breadth-over-depth module list.

**Steal:** Price accessibility as wedge; WhatsApp-era mobile expectations; multi-branch
single login; website builder as sticky add-on.
**Avoid:** Feature-list sprawl without workflow depth.

### Competitor #0 — the status quo (per product-vision.md)

Most target schools run on **paper registers + Excel + WhatsApp groups**, not another ERP.
EduBridge's true fight is against inertia and onboarding friction, not feature parity.
Implication: demos must show migration-from-chaos speed; every workflow must beat
"just send it on WhatsApp" for teacher effort. Incumbents lose here too — they behave
like IT-service vendors (ticket queues, slow setup).

### Closest direct comps (India, modern-positioning)

- **Teachmint** — Indian school OS: modules, connected-classroom hardware, self-serve
  onboarding, modern UI, freemium→paid ladder. The nearest analogue to EduBridge's
  "focused modules under one shell, generation ahead" pitch. Study its packaging
  (what they charge for, what they give away) and its pivots — it validates both
  the opportunity and the margin traps.
- **LEAD Group** — integrated school system + curriculum for affordable private
  schools; sells outcomes to owner-principals, often B2B2C at school-chain scale.
  Different model, but competes for the same semi-urban budget line. Threat if
  EduBridge targets low-fee schools without curriculum attach.
- **Toddle** — teaching/assessment platform strong in CBSE-international schools:
  planning, portfolios, report cards, rubrics. Direct overlap with Report Card Maker /
  Test Paper Creator at the premium end; proof that academic-depth modules can win
  standalone before a full ERP exists.

### Also on radar (not profiled in depth)

Vidyalaya, Edunext, Campus 365, MyClassboard — frequent shortlist names in
Indian RFPs; mostly follow the incumbent patterns above. Newer entrants compete on
transparent pricing + fast onboarding from Excel/WhatsApp chaos.

---

## Comparison matrix

| Dimension | Fedena | Entab CampusCare | PowerSchool | MyClassCampus |
|---|---|---|---|---|
| Origin / HQ | Bengaluru (Foradian) | Delhi (since 2000) | US (global) | Ahmedabad (2015) |
| Target | Large institutions, global | Established Indian private K-12 | NA districts, international | Budget schools/coaching, multi-branch |
| Pricing model | Tiered annual licence + setup | Quote-gated per-student/yr (~₹100–500) | Enterprise district contract | Per-student/yr (~₹100–150) |
| Modules | 100+ (tier-split) | Broad + board templates | SIS-centric platform suite | 40+ mobile-first |
| Parent app | Yes (fConnect) | Native 10x iOS/Android | Portal + app | App-first |
| Board compliance | CBSE/ICSE/IB/state | CBSE/ICSE/state deep, HPC claims | NA state reporting (model to study) | Basic |
| NEP posture | Partial | Marketing-forward, template-level | N/A (different market) | Minimal |
| Payments | Gateway integrations | Online fees via portal/app | NA payments products | Gateway + passbook |
| Distribution | Reseller/partner network | Demo-led direct sales | Direct enterprise + community | Direct, self-serve trial |

---

## India market context (design inputs)

- **Price bands (cloud, 2025–26):** ~₹50–300/student/yr typical; flat-fee ₹5k–₹1L+/yr;
  hybrid base+per-student common. A 500-student school lands ~₹20k–75k/yr;
  1,500-student ~₹75k–2.5L with modules. Transparency itself is a differentiator —
  most vendors hide pricing behind sales calls.
- **NEP 2020 is now a procurement test:** 5+3+3+4 stages (not 10+2 classes);
  Holistic Progress Card (PARAKH) with competency domains and **multi-rater input**
  (teacher/parent/self); APAAR ID stored as validated field + UDISE+ export;
  NCrF credits; mother-tongue instruction at Foundational stage (CBSE mandatory from
  July 2025) → parent comms/report cards need regional-language rendering;
  vocational/bagless-day tracking.
- **CBSE mechanics that decide deals:** 75% attendance threshold with alerts;
  A1–E grading scales configurable per stage; Term 1/Term 2 with 80/20 internal split;
  CCE co-scholastic records; bulk report-card PDF generation minutes after marks entry.
- **Payments:** Ministry of Education formally pushed UPI for school fees (Oct 2025).
  UPI/Razorpay/Cashfree + AutoPay mandates for instalments + defaulter/reconciliation
  workflows are table stakes, not premium.
- **Ground reality:** Most semi-urban/rural schools run Excel + paper + WhatsApp groups.
  Incumbents behave like IT-service vendors (ticket queues). Adoption blockers are
  cost opacity, onboarding effort, teacher training, not missing modules.
- **Hardware expectations (mid tier up):** biometric/RFID attendance, GPS bus tracking.
- **Regulatory:** DPDP Act consent/data-protection for minor data; data residency
  messaging matters to trust-sensitive buyers.

---

## Approach for EduBridge

### Positioning

Do **not** fight the module-count war (Fedena's game) or the 25-year-trust war
(Entab's game). Win on:

1. **Workflow depth over feature count** — fewer modules, dramatically better done.
   A fee module that kills reconciliation pain beats 100 mediocre ones.
2. **Modern UX + speed of onboarding** — live in days from Excel/WhatsApp chaos;
   transparent self-serve pricing (the anti-Entab move).
3. **NEP-native data model as moat** — HPC domains, competencies, APAAR ID, stages
   as first-class schema (`packages/db/src/schema/*`), not report-template bolt-ons.
   This is where every incumbent is weak.
4. **AI-native assistance within repo rules** — agents draft report-card remarks,
   circulars, fee reminders, timetable options; humans approve; writes go through
   server actions (AGENTS.md rule 6). No incumbent ships this credibly.
5. **Trust architecture** — hard multi-tenant isolation (rule 3) is also a sales asset:
   "your data can never leak across schools" is demonstrable, legacy installs can't say it.
6. **Mobile via PWA + WhatsApp** — deliberate non-goals (`product-vision.md`): native
   apps, payment gateways, marketplace. When incumbents' native apps or built-in
   payments look like gaps, remember they are decisions, not oversights; revisit only
   at the owning phase.

### Module priority — market logic vs EduBridge's build order

Market buying order in India: Fees (UPI + defaulters) → Parent comms (WhatsApp-grade,
regional languages) → Attendance (+CBSE 75% alerts) → Exams/report cards → Admissions
→ Transport/HR/library later.

**But the build order is already decided** (`docs/roadmap/README.md`): Dashboard → AI
→ Report Cards → Test Papers → Timetable, with an early manual fee ledger. Payment
gateways and full accounting are explicit non-goals for now (`product-vision.md`).
Use the market order for positioning/demos and future-phase sequencing only — never
to pull fees/UPI scope into the active phase (rule 2). The bet: academic modules +
AI win the pilot school first; money modules follow once trust exists.

### Pricing posture

Already decided (product-vision.md): **Normal/Pro/Max plans, 15-day Max trial,
upfront 3/6/12-month billing, no referral/coupon engine, per-school module toggles**.
The market lesson to keep: publish pricing transparently (the anti-Entab move) and
keep entry affordable enough for small schools. Free-tier experiments would contradict
the trial-based model — don't reintroduce them casually.

### Interoperability posture (learn from PowerSchool)

Clean public API, clean import/export (UDISE+, APAAR, Excel migration tooling),
no lock-in perception. Data portability wins deals against legacy vendors.

### Anti-patterns to refuse

- Cloning competitor feature grids into the roadmap (violates phase discipline, rule 2).
- Per-seat or per-message core pricing.
- English-only parent surfaces.
- Building hardware/firmware instead of integrating.
- Sales-led opacity (hidden pricing, forced demos) as growth model.

---

## Output convention

When this skill informs a decision, ground recommendations in the matrix/profiles and
flag which competitor pattern is being adopted or rejected, e.g. *"Adopting Entab-style
HPC generation, rejecting their quote-gated pricing"* — so strategy docs stay auditable.
