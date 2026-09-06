import { COOKIE_PREFIX, PLATFORM_DOMAIN } from "@/lib/brand";

// Local-development demo accounts. Mirrors docs/guides/auth-local-vs-prod.md.
// Never exposed in production: the modal that renders these is gated by
// process.env.NODE_ENV !== "production".

export type DemoAccount = {
  id: string;
  role: string;
  description: string;
  email: string;
  password: string;
  surface: "school" | "platform";
  path: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "admin",
    role: "School admin",
    description: "Full school workspace · pilot-admin",
    email: "admin@pilot-school.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "coordinator",
    role: "Coordinator",
    description: "Team + access management · pilot-coordinator",
    email: "coordinator@pilot-school.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "accountant",
    role: "Accountant",
    description: "Fees module · pilot-accountant",
    email: "accountant@pilot-school.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "teacher",
    role: "Teacher",
    description: "Staff workspace · pilot-teacher",
    email: "teacher@pilot-school.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "staff",
    role: "Staff",
    description: "Staff workspace · pilot-staff",
    email: "staff@pilot-school.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "oak-admin",
    role: "School admin (Oakwood)",
    description: "Second tenant · oak-admin",
    email: "admin@oakwood.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "oak-teacher",
    role: "Teacher (Oakwood)",
    description: "Second tenant · oak-teacher",
    email: "teacher@oakwood.edu",
    password: "TestLogin123!",
    surface: "school",
    path: "/sign-in",
  },
  {
    id: "owner",
    role: "Platform owner",
    description: "Operator console · platform-owner",
    email: `owner@${PLATFORM_DOMAIN}`,
    password: "TestLogin123!",
    surface: "platform",
    path: "/platform/sign-in",
  },
];

export const DEMO_PREFILL_EVENT = `${COOKIE_PREFIX}:demo-prefill`;

const STORAGE_KEY = `${COOKIE_PREFIX}.demo-prefill`;

/** Same-page fill: the sign-in form listens for this event. */
export function dispatchDemoPrefill(email: string, password: string) {
  window.dispatchEvent(
    new CustomEvent<{ email: string; password: string }>(DEMO_PREFILL_EVENT, {
      detail: { email, password },
    }),
  );
}

/** Cross-surface fill (e.g. owner → /platform/sign-in). */
export function stashDemoPrefill(email: string, password: string) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
}

/** Read + clear any pending cross-surface prefill. */
export function consumeDemoPrefill(): { email: string; password: string } | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    const parsed = JSON.parse(raw) as { email?: string; password?: string };
    if (typeof parsed.email === "string" && typeof parsed.password === "string") {
      return { email: parsed.email, password: parsed.password };
    }
  } catch {
    // ignore malformed stash
  }
  return null;
}
