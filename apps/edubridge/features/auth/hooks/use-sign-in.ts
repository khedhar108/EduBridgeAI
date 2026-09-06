"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { signInAction, type SignInState } from "../actions/sign-in";

export function useSignIn() {
  return useActionMutation<SignInState, FormData>(
    queryKeys.auth.signIn(),
    (formData) => signInAction({}, formData),
    { clearCache: true },
  );
}
