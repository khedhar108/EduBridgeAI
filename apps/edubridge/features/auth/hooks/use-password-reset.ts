"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  requestPasswordResetAction,
  updatePasswordAction,
  type ForgotPasswordState,
  type UpdatePasswordState,
} from "../actions/forgot-password";

export function useForgotPassword() {
  return useActionMutation<ForgotPasswordState, FormData>(
    queryKeys.auth.forgotPassword(),
    (formData) => requestPasswordResetAction({}, formData),
  );
}

export function useUpdatePassword() {
  return useActionMutation<UpdatePasswordState, FormData>(
    queryKeys.auth.updatePassword(),
    (formData) => updatePasswordAction({}, formData),
    { clearCache: true },
  );
}
