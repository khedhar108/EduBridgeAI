"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  registerStudentAction,
  type RegisterStudentState,
} from "../actions/register-student";

export function useRegisterStudent(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  return useActionMutation<RegisterStudentState, FormData>(
    queryKeys.fees.registerStudent(),
    (formData) => registerStudentAction(workspace, {}, formData),
    {
      schoolId,
      userId,
      extraKeys: schoolId ? [queryKeys.students.all(schoolId)] : undefined,
    },
  );
}
