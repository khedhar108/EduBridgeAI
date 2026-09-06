"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  publishFeePlanAction,
  type PublishFeePlanState,
} from "../actions/publish-fee-plan";

export function usePublishFeePlan(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<PublishFeePlanState, FormData>(
    queryKeys.fees.publishPlan(),
    (formData) => publishFeePlanAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
