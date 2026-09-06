"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  familyAddChildAction,
  type FamilyAddChildState,
} from "../actions/add-child";

export function useFamilyAddChild() {
  return useActionMutation<FamilyAddChildState, FormData>(
    queryKeys.auth.familyAddChild(),
    (formData) => familyAddChildAction({}, formData),
    { clearCache: true },
  );
}
