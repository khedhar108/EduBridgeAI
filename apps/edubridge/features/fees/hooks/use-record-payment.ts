"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  recordPaymentAction,
  type RecordPaymentState,
} from "../actions/record-payment";

export function useRecordPayment(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<RecordPaymentState, FormData>(
    queryKeys.fees.recordPayment(),
    (formData) => recordPaymentAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
