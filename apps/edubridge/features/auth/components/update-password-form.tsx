"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "../actions/forgot-password";
import { PasswordField } from "@repo/ui/components/password-field";

const initial: UpdatePasswordState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initial,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        disabled={pending}
      />
      <PasswordField
        id="passwordConfirm"
        name="passwordConfirm"
        label="Confirm password"
        autoComplete="new-password"
        disabled={pending}
      />
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Save password
      </Button>
    </form>
  );
}
