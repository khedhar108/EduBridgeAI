"use server";

import { revalidatePath } from "next/cache";
import {
  adminAuditEvents,
  eq,
  schools,
  withTenant,
  type SchoolRole,
} from "@repo/db";
import {
  HUB_ROLES,
  isCapability,
  isHubCellLocked,
  withHubFlag,
} from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";

export type SetHubFlagState = { error?: string; ok?: boolean };

function isHubRole(value: string): value is SchoolRole {
  return (HUB_ROLES as readonly string[]).includes(value);
}

export async function setHubFlagAction(
  workspace: string,
  capability: string,
  role: string,
  enabled: boolean,
): Promise<SetHubFlagState> {
  const ctx = await getSessionContext(workspace);
  if (!ctx) return { error: "Sign in required." };
  if (ctx.role !== "school_admin") {
    return { error: "Only the school admin can change Control Hub." };
  }
  if (!isCapability(capability) || !isHubRole(role)) {
    return { error: "Invalid permission." };
  }
  if (isHubCellLocked(capability, role)) {
    return { error: "That permission cannot be changed." };
  }

  const next = withHubFlag(ctx.capabilityOverrides, capability, role, enabled);
  if ("error" in next) return { error: next.error };

  try {
    await withTenant(
      { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
      async (tx) => {
        await tx
          .update(schools)
          .set({ capabilityOverrides: next.overrides, updatedAt: new Date() })
          .where(eq(schools.id, ctx.schoolId));

        await tx.insert(adminAuditEvents).values({
          schoolId: ctx.schoolId,
          actorId: ctx.userId,
          action: "control.hub_flag",
          entityType: "school",
          entityId: ctx.schoolId,
          detail: { capability, role, enabled },
        });
      },
    );
  } catch (err) {
    console.error("setHubFlagAction failed", err);
    return { error: "Could not save that switch. Try again." };
  }

  revalidatePath(`/${workspace}`);
  revalidatePath(`/${workspace}/settings/control`);
  return { ok: true };
}
