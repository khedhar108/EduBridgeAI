# Research DPDP fiduciary vs processor wording

Type: `wayfinder:research` (AFK)  
Status: **resolved**

## Question

Is “school = Data Fiduciary, platform = Data Processor” the right DPDP posture for a multi-tenant SIS? What residual risk remains for the family door (admission number + student DOB, including student self-entry)?

## Resolution

Under the Digital Personal Data Protection Act, 2023, a **Data Fiduciary** determines the purpose and means of processing; a **Data Processor** processes on the fiduciary’s behalf. A school that enrols pupils, chooses what to record, and instructs the software is the fiduciary for student, parent, and staff records it enters. EduBridge, acting only on those instructions and not determining extra purposes (ads, resale, cross-school profiling), is a processor.

Do **not** independently determine new purposes in product copy or code, or the operator can be treated as a fiduciary (and, if notified as a Significant Data Fiduciary, pick up extra duties).

**Children (under 18):** verifiable parental consent is the fiduciary’s duty. The platform must not claim it collected enrolment consent. Family proof (admission + DOB) is an access control the **school** instructed, not age verification by the processor.

**Residual risk:** a student can open the family door without a parent present. Mitigate in Terms: school + parent remain responsible; we do not independently verify age; student use is at the school’s instruction. Do not pretend this is verifiable parental consent under DPDP s.9.

Sources: DPDP Act 2023 (fiduciary / processor definitions; consent; processing of children’s data). Not legal advice.
