"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  recordAttendanceAction,
  type RecordAttendanceState,
} from "../actions/record-attendance";

export function useRecordAttendance(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<RecordAttendanceState, FormData>(
    queryKeys.students.recordAttendance(),
    (formData) => recordAttendanceAction(workspace, {}, formData),
    { schoolId, userId },
  );
}
