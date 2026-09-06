"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  resendRegisterOtpAction,
  verifyRegisterOtpAction,
  type VerifyRegisterState,
} from "../actions/register-school";

export function useVerifyRegisterOtp() {
  return useActionMutation<VerifyRegisterState, FormData>(
    queryKeys.registration.verifyOtp(),
    (formData) => verifyRegisterOtpAction({}, formData),
    { clearCache: true },
  );
}

export function useResendRegisterOtp() {
  return useActionMutation<VerifyRegisterState, FormData>(
    queryKeys.registration.resendOtp(),
    (formData) => resendRegisterOtpAction({}, formData),
  );
}
