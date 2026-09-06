"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  familySignInAction,
  type FamilySignInState,
} from "../actions/family-sign-in";

export function useFamilySignIn() {
  return useActionMutation<FamilySignInState, FormData>(
    queryKeys.auth.familySignIn(),
    (formData) => familySignInAction({}, formData),
    { clearCache: true },
  );
}
