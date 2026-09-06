"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  activateMembershipRequestAction,
  rejectMembershipRequestAction,
  type ActivateMemberState,
} from "../actions/activate-member";

export function useActivateMember(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<ActivateMemberState, FormData>(
    queryKeys.auth.activateMember(),
    (formData) => activateMembershipRequestAction(workspace, {}, formData),
    { schoolId, userId },
  );
}

export function useRejectMember(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<ActivateMemberState, FormData>(
    queryKeys.auth.rejectMember(),
    (formData) => rejectMembershipRequestAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
