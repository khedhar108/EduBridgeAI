import type { User } from "@supabase/supabase-js";
import { requireUser } from "../auth/get-user";

/**
 * Phase 0: platform claim via app_metadata (service-role set only).
 * Phase 6: prefer platform_admins table as source of truth.
 * ponytail: claim cache until platform_admins lands
 */
export function isPlatformOwnerUser(user: User): boolean {
  const meta = user.app_metadata ?? {};
  return meta.platform_owner === true || meta.role === "platform_owner";
}

export async function getPlatformContext() {
  const user = await requireUser();
  if (!user || !isPlatformOwnerUser(user)) return null;
  return {
    userId: user.id,
    email: user.email,
    isPlatformOwner: true as const,
  };
}
