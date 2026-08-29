"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "../actions/forgot-password";

const initial: UpdatePasswordState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initial,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11"
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="passwordConfirm" className="text-sm font-medium">
          Confirm password
        </label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11"
          disabled={pending}
        />
      </div>
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
