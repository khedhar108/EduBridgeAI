import { PLATFORM_NAME } from "@/lib/brand";
import {
  DPA_ROLE_PLATFORM,
  DPA_ROLE_SCHOOL,
  GRIEVANCE_EMAIL,
  LEGAL_DOCS_IN_FORCE,
  PRIVACY_EMAIL,
  PRIVACY_VERSION,
  operatorParty,
} from "@/lib/legal/constants";
import type { LegalSection } from "./terms";

function statusLine(): string {
  if (LEGAL_DOCS_IN_FORCE) {
    return `This Privacy Policy (version ${PRIVACY_VERSION}) describes how ${operatorParty()} processes personal data when you use ${PLATFORM_NAME}.`;
  }
  return `This Privacy Policy (version ${PRIVACY_VERSION}) is a draft for transparency. It is not a DPDP notice in force until the operator is named and the document is marked in force.`;
}

export const PRIVACY_TITLE = "Privacy Policy";

export const PRIVACY_INTRO = `${statusLine()} It is written for the Digital Personal Data Protection Act, 2023. It is not titled as a GDPR notice. If you access ${PLATFORM_NAME} from the EEA, we still apply these practices; we do not appoint an EU representative at this time.`;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "what",
    title: "What we process",
    body: `Staff and platform identity (email or username, name, role, membership). School profile. Student roster fields the school enters (including admission number and date of birth used to match a family session). Family proof is checked and is not stored as a password. Session cookies, impersonation context for administrators, and optional “Remember me” values in localStorage if you choose that box.`,
  },
  {
    id: "why",
    title: "Why",
    body: `To provide the school workspace, keep sessions secure, let parents or students see the slice the school instructed, and respond to support or legal requests.`,
  },
  {
    id: "who",
    title: "Who",
    body: `The school is the ${DPA_ROLE_SCHOOL} for tenant records it enters. ${operatorParty()} is the ${DPA_ROLE_PLATFORM}. Subprocessors today: Supabase (authentication and PostgreSQL) in region ap-south-1 (Mumbai). We do not sell personal data. We do not claim “we never share” — hosting and auth require those processors.`,
  },
  {
    id: "children",
    title: "Children",
    body: `Data of minors is processed because the school instructed ${PLATFORM_NAME} to hold the roster and related records. Parents may use the family door. ${operatorParty()} does not collect enrolment consent and does not independently verify parental presence when a student enters the family door.`,
  },
  {
    id: "rights",
    title: "Your rights",
    body: `Access, correction, erasure, and grievance under DPDP. For student or school records, ask the school first — ${operatorParty()} cannot safely change another tenant’s data on a parent’s word without breaking isolation. ${operatorParty()} handles identity on platform-operator accounts. Grievance: ${GRIEVANCE_EMAIL}. Privacy questions: ${PRIVACY_EMAIL}.`,
  },
  {
    id: "retention",
    title: "Retention",
    body: `Tenant data is kept while the school uses ${PLATFORM_NAME}, plus a short backup window and any legal hold. Family sessions last about thirty days from sign-in unless cleared. Staff sessions follow the auth provider.`,
  },
  {
    id: "security",
    title: "Security",
    body: `${PLATFORM_NAME} uses row-level security, school-scoped queries, and server-side role checks as operating practice. That is not an ISO, SOC 2, or other certification claim.`,
  },
];
