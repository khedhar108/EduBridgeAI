"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { QueryIsland } from "@/lib/query/island";
import type { ForgotPasswordState } from "../actions/forgot-password";
import { useForgotPassword } from "../hooks/use-password-reset";

const initial: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  return (
    <QueryIsland>
      <ForgotPasswordFields />
    </QueryIsland>
  );
}

function ForgotPasswordFields() {
  const { mutate, isPending: pending, data: mutationResult } =
    useForgotPassword();
  const state = mutationResult ?? initial;
  useActionToast(
    state,
    "If that email is on an account, we sent a reset link.",
  );

  return (
    <form
      action={(formData) => {
        mutate(formData);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11"
          disabled={pending}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Send reset link
      </Button>
    </form>
  );
}
