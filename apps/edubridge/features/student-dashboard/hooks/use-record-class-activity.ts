"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  recordClassActivityAction,
  type RecordClassActivityState,
} from "../actions/record-class-activity";

export function useRecordClassActivity(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<RecordClassActivityState, FormData>(
    queryKeys.students.recordActivity(),
    (formData) => recordClassActivityAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
