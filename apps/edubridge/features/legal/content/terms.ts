import { PLATFORM_NAME } from "@/lib/brand";
import {
  DPA_ROLE_PLATFORM,
  DPA_ROLE_SCHOOL,
  GOVERNING_LAW,
  GRIEVANCE_EMAIL,
  LEGAL_DOCS_IN_FORCE,
  LIABILITY_FLOOR_INR,
  TERMS_VERSION,
  forumLine,
  operatorParty,
  registeredOfficeLine,
} from "@/lib/legal/constants";

export type LegalSection = {
  id: string;
  title: string;
  body: string;
};

function statusLine(): string {
  if (LEGAL_DOCS_IN_FORCE) {
    return `These Terms of Use (version ${TERMS_VERSION}) are in force between you and ${operatorParty()}.`;
  }
  return `These Terms of Use (version ${TERMS_VERSION}) are a draft published for transparency. They do not form a contract and do not bind ${operatorParty()} or you until the operator is named and this document is marked in force.`;
}

export const TERMS_TITLE = `Terms of Use`;

export const TERMS_INTRO = statusLine();

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "parties",
    title: "1. Parties",
    body: `These terms describe ${PLATFORM_NAME}, a multi-tenant school software service operated by ${operatorParty()}, with a registered / correspondence location at ${registeredOfficeLine()}. “School” means the educational institution that holds a workspace. “You” means a staff member, platform operator, parent, guardian, or student who uses ${PLATFORM_NAME}. The school acts for its staff and for parents and students it admits.`,
  },
  {
    id: "not-a-school",
    title: "2. Not a school and not a board",
    body: `${PLATFORM_NAME} is software. ${operatorParty()} does not grant board affiliation, CBSE or other recognition, academic certification, or a place in any school. Marks, attendance, report cards, and similar records are the school’s responsibility.`,
  },
  {
    id: "roles",
    title: "3. Data roles (DPDP)",
    body: `For personal data the school enters about students, parents, and staff, the school is the ${DPA_ROLE_SCHOOL} under the Digital Personal Data Protection Act, 2023. ${operatorParty()} is the ${DPA_ROLE_PLATFORM} and processes that data only to provide the workspace the school instructed. The school warrants it has authority to upload the data and, for children, that it has obtained verifiable parental consent where the Act requires it. ${PLATFORM_NAME} is not the consent-collector for enrolment.`,
  },
  {
    id: "accounts",
    title: "4. Accounts and security",
    body: `Staff and platform users sign in with credentials the school or operator issued. Parents and students may enter with admission number and student date of birth; that proof issues a family session, not a staff account. You must keep credentials confidential. Administrators may impersonate a staff identity inside their school for support; that does not transfer the administrator’s password. You must not share passwords or attempt to use another school’s workspace.`,
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use",
    body: `You must not try to read or change another school’s data, scrape tenants, probe the service for cross-school access, upload unlawful content, or use the service to harm students or staff. We may suspend a workspace or account for breach, legal duty, or abuse. Tenant isolation does not stop ${operatorParty()} from suspending the tenant that is abusing the service.`,
  },
  {
    id: "minors",
    title: "6. Students and children",
    body: `The family door may be used by a parent or guardian or by a student. ${operatorParty()} does not independently verify age or that a parent is present. Residual risk: a student may enter without a parent. The school and the parent or guardian remain responsible for that access. Student use is treated as access the school instructed, not as ${PLATFORM_NAME} collecting parental consent.`,
  },
  {
    id: "ai",
    title: "7. AI drafts",
    body: `Where ${PLATFORM_NAME} offers assistants, they draft text or options. Humans must review and approve. Writes go through the same server actions and role checks as the rest of the product. There is no warranty that AI remarks, summaries, papers, or other drafts are accurate, complete, or board-compliant. Do not treat drafts as legal, medical, or regulatory advice.`,
  },
  {
    id: "ip",
    title: "8. Intellectual property",
    body: `The school owns the data it enters. ${operatorParty()} owns the software, design, and documentation. You may not reverse engineer, copy, or resell the service except as Indian law allows. Feedback you send may be used to improve ${PLATFORM_NAME} without obligation to you.`,
  },
  {
    id: "availability",
    title: "9. Availability",
    body: `${operatorParty()} will use reasonable efforts to keep ${PLATFORM_NAME} available and to give notice of planned maintenance. There is no service-level commitment in this phase. The service may be interrupted, changed, or withdrawn.`,
  },
  {
    id: "liability",
    title: "10. Limitation of liability",
    body: `To the extent Indian law allows, ${operatorParty()} is not liable for indirect, incidental, special, or consequential loss, or loss of data, marks, or reputation. Direct liability for a claim arising from the service is capped at the fees you (or your school) paid for ${PLATFORM_NAME} in the twelve months before the claim, or ₹${LIABILITY_FLOOR_INR} if no such fees were paid. This cap does not exclude liability that cannot be excluded by law, including for fraud or wilful misconduct. Complete “zero liability” language is not used.`,
  },
  {
    id: "indemnity",
    title: "11. Indemnity",
    body: `The school will indemnify ${operatorParty()} against claims, damages, and reasonable costs arising from the school’s data, missing parental consent, misuse of the workspace, or the school’s breach of these terms, except to the extent caused by ${operatorParty()}’s fraud or wilful misconduct.`,
  },
  {
    id: "suspension",
    title: "12. Suspension and deletion",
    body: `${operatorParty()} may suspend or end access for breach, legal requirement, or (when billing exists) non-payment. The school may request export or deletion of tenant data subject to backups and legal holds. Isolation between schools does not prevent lawful process aimed at one school.`,
  },
  {
    id: "changes",
    title: "13. Changes",
    body: `${operatorParty()} may update these terms. The version identifier is ${TERMS_VERSION} until a later version is published. When the version changes, ${PLATFORM_NAME} will ask you to accept again on sign-in or join. Continued use after a version you have not accepted is not treated as acceptance.`,
  },
  {
    id: "law",
    title: "14. Governing law and exclusive jurisdiction",
    body: `These terms are governed by ${GOVERNING_LAW}. Courts other than the forum below have no jurisdiction over disputes arising out of or relating to ${PLATFORM_NAME} or these terms. The exclusive forum is ${forumLine()}. The parties submit to that court only.`,
  },
  {
    id: "grievance",
    title: "15. Grievance",
    body: `Write to ${GRIEVANCE_EMAIL}. ${operatorParty()} will acknowledge within twenty-four hours of a working day and aim to resolve within fifteen days, or explain why more time is needed. This channel is for platform operation. Requests about a student’s school record should go to the school first.`,
  },
  {
    id: "boilerplate",
    title: "16. Severability and entire agreement",
    body: `If a clause is unenforceable, the rest remains. These terms (when in force), the Privacy Policy, and the Cookie Policy are the entire agreement for use of ${PLATFORM_NAME} and replace prior statements on the same subject. They do not create a partnership or employment.`,
  },
];
