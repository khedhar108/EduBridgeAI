import type { SchoolRole } from "@repo/db";
import type { SessionContext } from "../tenancy/session-context";

/**
 * Centralized capability map — the single source of truth for privileged
 * actions. All admin/coordinator call sites route through `can()` /
 * `assertCapability()` instead of scattered `assertRole` lists, so future
 * per-module permission overrides extend the map without touching callers.
 *
 * RLS remains the backstop (re-checks school_members + is_active); this is
 * the friendly first line.
 */

export type Capability =
  | "members.viewDirectory"
  | "members.invite"
  | "members.activate"
  | "members.deactivate"
  | "members.reactivate"
  | "members.changeRole"
  | "members.impersonate"
  | "team.view";

const ADMIN_ONLY: SchoolRole[] = ["school_admin"];
const MANAGERS: SchoolRole[] = ["school_admin", "coordinator"];

/** Roles a coordinator must never touch (privilege escalation guard). */
const PROTECTED_ROLES: SchoolRole[] = ["school_admin", "coordinator"];

export const CAPABILITIES: Record<Capability, SchoolRole[]> = {
  "members.viewDirectory": MANAGERS,
  "members.invite": MANAGERS,
  "members.activate": MANAGERS,
  "members.deactivate": MANAGERS,
  "members.reactivate": MANAGERS,
  "members.changeRole": ADMIN_ONLY,
  "members.impersonate": ADMIN_ONLY,
  "team.view": MANAGERS,
};

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
  const allowed = CAPABILITIES[capability];
  if (!allowed.includes(ctx.role)) return false;

  if (targetRole && ctx.role === "coordinator") {
    if (PROTECTED_ROLES.includes(targetRole)) return false;
  }

  return true;
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
