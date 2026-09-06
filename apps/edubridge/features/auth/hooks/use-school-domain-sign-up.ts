"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  schoolDomainSignUpAction,
  type SchoolDomainSignUpState,
} from "../actions/school-domain-sign-up";

export function useSchoolDomainSignUp() {
  return useActionMutation<SchoolDomainSignUpState, FormData>(
    queryKeys.auth.schoolDomainSignUp(),
    (formData) => schoolDomainSignUpAction({}, formData),
  );
}
