"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearQueryCache } from "./client";
import { isNextNavigationError } from "./errors";
import { invalidateTenantQueries } from "./invalidate-tenant";

type ActionState = {
  ok?: boolean;
  error?: string;
};

type Options<TState> = {
  schoolId?: string;
  userId?: string;
  /** Wipe TQ before identity-changing actions (sign-in). */
  clearCache?: boolean;
  extraKeys?: readonly (readonly unknown[])[];
  onOk?: (result: TState) => void;
};

function shouldInvalidate(result: ActionState): boolean {
  if (result.error) return false;
  if (result.ok === false) return false;
  return true;
}

export function useActionMutation<TState extends ActionState, TVars>(
  mutationKey: readonly unknown[],
  mutationFn: (vars: TVars) => Promise<TState>,
  options?: Options<TState>,
) {
  const queryClient = useQueryClient();

  return useMutation<TState, Error, TVars>({
    mutationKey,
    mutationFn: async (vars) => {
      if (options?.clearCache) {
        clearQueryCache();
      }
      try {
        return await mutationFn(vars);
      } catch (error) {
        if (isNextNavigationError(error)) throw error;
        throw error;
      }
    },
    onSuccess: (result) => {
      if (!shouldInvalidate(result)) return;
      invalidateTenantQueries(queryClient, options?.schoolId, options?.userId);
      for (const key of options?.extraKeys ?? []) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      options?.onOk?.(result);
    },
    retry: 0,
  });
}
