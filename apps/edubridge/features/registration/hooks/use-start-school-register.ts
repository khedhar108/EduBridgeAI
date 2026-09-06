"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  startSchoolRegisterAction,
  type RegisterSchoolState,
} from "../actions/register-school";

export function useStartSchoolRegister() {
  return useActionMutation<RegisterSchoolState, FormData>(
    queryKeys.registration.start(),
    (formData) => startSchoolRegisterAction({}, formData),
    { clearCache: true },
  );
}
