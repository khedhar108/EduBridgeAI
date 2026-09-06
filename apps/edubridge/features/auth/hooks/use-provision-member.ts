"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  provisionMemberAction,
  type ProvisionMemberState,
} from "../actions/provision-member";

export function useProvisionMember(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<ProvisionMemberState, FormData>(
    queryKeys.auth.provisionMember(),
    (formData) => provisionMemberAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
