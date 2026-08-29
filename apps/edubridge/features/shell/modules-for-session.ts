import { can } from "@/lib/auth/capabilities";
import type { SessionContext } from "@/lib/tenancy/session-context";
import { modules, type ModuleNavItem } from "./modules";

/** Nav from Hub-aware `can()`, not the static role list alone. */
export function modulesForSession(ctx: SessionContext): ModuleNavItem[] {
  return modules.filter((item) => {
    switch (item.id) {
      case "fees":
        return can(ctx, "fees.view");
      case "students":
        return can(ctx, "students.view");
      case "control":
        return can(ctx, "control.view");
      case "team":
        return can(ctx, "team.view");
      default:
        return item.allowedRoles.includes(ctx.role);
    }
  });
}
