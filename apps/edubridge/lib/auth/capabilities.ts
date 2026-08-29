import type { SchoolRole } from "@repo/db";
import type { SessionContext } from "../tenancy/session-context";

/**
 * Centralized capability map — the single source of truth for privileged
 * actions. All admin/coordinator call sites route through `can()` /
 * `assertCapability()` instead of scattered `assertRole` lists, so future
 * per-module permission overrides extend the map without touching callers.
 *
 * RLS remains the backstop (re-checks school_members + is_active +
 * archived_at IS NULL); this is the friendly first line.
 */

export type Capability =
  | "control.view"
  | "members.viewDirectory"
  | "members.provision"
  | "members.resetPassword"
  | "members.activate"
  | "members.deactivate"
  | "members.reactivate"
  | "members.archive"
  | "members.changeRole"
  | "members.impersonate"
  | "team.view"
  | "students.view"
  | "students.register"
  | "students.recordAttendance"
  | "students.recordActivities"
  | "students.manageStructure"
  | "fees.view"
  | "fees.structure"
  | "fees.collect";

const ADMIN_ONLY: SchoolRole[] = ["school_admin"];
const MANAGERS: SchoolRole[] = ["school_admin", "coordinator"];
const CLASS_ENTRY: SchoolRole[] = ["school_admin", "teacher", "staff"];
const MONEY_VIEW: SchoolRole[] = ["school_admin", "accountant"];

/** Roles a coordinator must never touch (privilege escalation guard). */
const PROTECTED_ROLES: SchoolRole[] = ["school_admin", "coordinator"];

export const CAPABILITIES: Record<Capability, SchoolRole[]> = {
  "control.view": ADMIN_ONLY,
  "members.viewDirectory": MANAGERS,
  "members.provision": MANAGERS,
  "members.resetPassword": MANAGERS,
  "members.activate": MANAGERS,
  "members.deactivate": MANAGERS,
  "members.reactivate": MANAGERS,
  "members.archive": ADMIN_ONLY,
  "members.changeRole": ADMIN_ONLY,
  "members.impersonate": ADMIN_ONLY,
  "team.view": MANAGERS,
  "students.view": CLASS_ENTRY,
  "students.register": MANAGERS,
  "students.recordAttendance": CLASS_ENTRY,
  "students.recordActivities": CLASS_ENTRY,
  "students.manageStructure": ADMIN_ONLY,
  "fees.view": MONEY_VIEW,
  "fees.structure": ADMIN_ONLY,
  "fees.collect": MONEY_VIEW,
};

/** Columns on Control Hub (student/parent are not staff grants). */
export const HUB_ROLES: SchoolRole[] = [
  "school_admin",
  "coordinator",
  "accountant",
  "teacher",
  "staff",
];

const HUB_ROLE_SET = new Set<string>(HUB_ROLES);

/** Hub may not change these. Admin column stays on. */
export const LOCKED_CAPABILITIES = new Set<Capability>([
  "control.view",
  "members.archive",
  "members.changeRole",
  "members.impersonate",
]);

export const OVERRIDABLE_CAPABILITIES = new Set<Capability>([
  "students.view",
  "students.register",
  "fees.view",
  "fees.collect",
  "fees.structure",
]);

export function isCapability(value: string): value is Capability {
  return Object.hasOwn(CAPABILITIES, value);
}

export function asCapabilityOverrides(
  raw: unknown,
): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!Array.isArray(value)) continue;
    const roles = value.filter((item): item is string => typeof item === "string");
    if (roles.length > 0) out[key] = roles;
  }
  return out;
}

export function isHubCellLocked(capability: Capability, role: SchoolRole): boolean {
  if (role === "school_admin") return true;
  if (!OVERRIDABLE_CAPABILITIES.has(capability)) return true;
  // Fees writes stay admin|accountant. Coordinator collect waits on write RLS.
  if (capability === "fees.structure") return role !== "accountant";
  if (capability === "fees.collect") return role !== "accountant";
  if (capability === "fees.view") {
    return role !== "accountant" && role !== "coordinator";
  }
  if (capability === "students.register") return role !== "coordinator";
  return false;
}

function sameRoles(a: SchoolRole[], b: SchoolRole[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((role) => set.has(role));
}

/** Role list for a capability: override if present, else default. */
export function rolesFor(
  capability: Capability,
  overrides: Record<string, string[]> | undefined,
): SchoolRole[] {
  const defaults = CAPABILITIES[capability];
  if (LOCKED_CAPABILITIES.has(capability) || !overrides) return defaults;
  const raw = overrides[capability];
  if (!raw) return defaults;

  const next = raw.filter((role): role is SchoolRole => HUB_ROLE_SET.has(role));
  if (defaults.includes("school_admin") && !next.includes("school_admin")) {
    next.unshift("school_admin");
  }
  if (capability === "fees.structure") {
    return next.filter((role) => role !== "coordinator");
  }
  return next.length > 0 ? next : defaults;
}

/** Sparse map of keys that differ from defaults. */
export function compactOverrides(
  overrides: Record<string, string[]>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of Object.keys(CAPABILITIES) as Capability[]) {
    if (!OVERRIDABLE_CAPABILITIES.has(key)) continue;
    const resolved = rolesFor(key, overrides);
    if (!sameRoles(resolved, CAPABILITIES[key])) {
      out[key] = resolved;
    }
  }
  return out;
}

export function withHubFlag(
  current: Record<string, string[]>,
  capability: Capability,
  role: SchoolRole,
  enabled: boolean,
): { overrides: Record<string, string[]> } | { error: string } {
  if (isHubCellLocked(capability, role)) {
    return { error: "That permission cannot be changed." };
  }
  const nextRoles = new Set(rolesFor(capability, current));
  if (enabled) nextRoles.add(role);
  else nextRoles.delete(role);
  return {
    overrides: compactOverrides({
      ...current,
      [capability]: [...nextRoles],
    }),
  };
}

export const CAPABILITY_GROUPS: {
  id: string;
  title: string;
  items: { key: Capability; label: string }[];
}[] = [
  {
    id: "team",
    title: "Team",
    items: [
      { key: "team.view", label: "Open Team" },
      { key: "members.viewDirectory", label: "View directory" },
      { key: "members.provision", label: "Add member" },
      { key: "members.resetPassword", label: "Reset password" },
      { key: "members.activate", label: "Activate join" },
      { key: "members.deactivate", label: "Deactivate" },
      { key: "members.reactivate", label: "Reactivate" },
      { key: "members.archive", label: "Archive" },
      { key: "members.changeRole", label: "Change role" },
      { key: "members.impersonate", label: "Login as" },
    ],
  },
  {
    id: "students",
    title: "Students",
    items: [
      { key: "students.view", label: "Open Students" },
      { key: "students.register", label: "Register student (SIS)" },
      { key: "students.recordAttendance", label: "Record attendance" },
      { key: "students.recordActivities", label: "Record activities" },
      { key: "students.manageStructure", label: "Manage classes" },
    ],
  },
  {
    id: "fees",
    title: "Fees",
    items: [
      { key: "fees.view", label: "Open Fees" },
      { key: "fees.structure", label: "Publish fee structures" },
      { key: "fees.collect", label: "Record payments" },
    ],
  },
];

/**
 * Check a capability. When `targetRole` is supplied, coordinators are blocked
 * from acting on admins or other coordinators (no privilege escalation).
 * Admins always pass the role guard (OR short-circuit).
 */
export function can(
  ctx: SessionContext,
  capability: Capability,
  targetRole?: SchoolRole,
): boolean {
  const allowed = rolesFor(capability, ctx.capabilityOverrides);
  if (!allowed.includes(ctx.role)) return false;

  if (targetRole && ctx.role === "coordinator") {
    if (PROTECTED_ROLES.includes(targetRole)) return false;
  }

  return true;
}

export function buildHubMatrix(
  overrides?: Record<string, string[]>,
): {
  id: string;
  title: string;
  items: {
    key: Capability;
    label: string;
    cells: {
      role: SchoolRole;
      roleLabel: string;
      on: boolean;
      locked: boolean;
    }[];
  }[];
}[] {
  return CAPABILITY_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => ({
      key: item.key,
      label: item.label,
      cells: HUB_ROLES.map((role) => ({
        role,
        roleLabel: role.replace(/_/g, " "),
        on: rolesFor(item.key, overrides).includes(role),
        locked: isHubCellLocked(item.key, role),
      })),
    })),
  }));
}

/** Throw if the session lacks a capability. Friendly 403 layer above RLS. */
export function assertCapability(
  ctx: SessionContext,
  capability: Capability,
  targetRole?: SchoolRole,
): void {
  if (!can(ctx, capability, targetRole)) {
    throw new Error("Forbidden");
  }
}
