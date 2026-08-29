# What PII may we store for Aadhaar

Type: `wayfinder:research` (AFK)  
Status: **resolved**

## Question

Under UIDAI rules and DPDP, may EduBridge store an Aadhaar number (full or last-4) on `students` / `student_guardians`, or only a document file? Child vs parent-at-counter.

## Resolution

**File-only. Never persist the 12-digit Aadhaar number, a last-4 column, a UID token, or e-KYC XML in Postgres.**

This is product posture for a school SIS that is **not** a UIDAI Authentication User Agency / KYC User Agency. It is **not legal advice**.

### UIDAI / Aadhaar Act

Entities that collect Aadhaar numbers for UIDAI authentication must keep those numbers (and connected e-KYC data) in an **Aadhaar Data Vault**, using reference keys everywhere else. EduBridge will not become an AUA/KUA, will not call UIDAI APIs, and will not implement a vault. Therefore we must not store Aadhaar numbers in business tables at all.

A scan of an identity card (including a **masked** Aadhaar PDF where the first eight digits are hidden) is a document the school asked the adult to show at the counter. Store that object in the private `student-documents` bucket. Prefer masked Aadhaar when the school uploads an Aadhaar card.

Last-4 in a searchable column is still Aadhaar-related PII and an extra leak surface. Skip it. The file is enough to show “someone produced ID at enrolment.”

### Child Aadhaar

Out of scope for this map. School admission is not a Section 7 subsidy/service; courts have treated **mandatory child Aadhaar for admission** as constitutionally fraught (`Puttaswamy`). Do not collect the child’s Aadhaar number or child Aadhaar scan on the SIS form.

### DPDP (already mapped)

School = Data Fiduciary; platform = Data Processor ([fiduciary vs processor](./research-dpdp-fiduciary-vs-processor.md)). Collecting a parent-at-counter ID scan is at the **school’s** instruction for enrolment identity of the adult, not processor-run e-KYC. Children’s data remains the fiduciary’s duty (verifiable parental consent). Do not claim the scan is DPDP s.9 age verification.

### Same rule for DL / passport numbers

No `driving_licence_number` / `passport_number` columns either. Type enum + Storage path only. Confirm the type list on [Identity proof](./grill-identity-proof-type-and-file.md).

Sources: Aadhaar Act 2016; UIDAI Aadhaar Data Vault circulars / 2025 FAQs (ADV for REs / AUA-KUA flows); DPDP Act 2023 s.9; existing fiduciary ticket. Not legal advice.
