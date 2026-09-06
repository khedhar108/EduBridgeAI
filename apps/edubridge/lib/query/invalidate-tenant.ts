import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

/** Invalidate the tightest tenant prefix we have for this island. */
export function invalidateTenantQueries(
  queryClient: QueryClient,
  schoolId?: string,
  userId?: string,
) {
  if (schoolId && userId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.user(schoolId, userId),
    });
    return;
  }
  if (schoolId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.school(schoolId),
    });
    return;
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.root });
}
