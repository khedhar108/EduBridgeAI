"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  resetMemberPasswordAction,
  type ResetMemberPasswordState,
} from "../actions/reset-member-password";

export function useResetMemberPassword(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<ResetMemberPasswordState, FormData>(
    queryKeys.auth.resetMemberPassword(),
    (formData) => resetMemberPasswordAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
