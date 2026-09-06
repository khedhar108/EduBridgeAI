"use client";

import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { QueryIsland } from "@/lib/query/island";
import type { UpdatePasswordState } from "../actions/forgot-password";
import { useUpdatePassword } from "../hooks/use-password-reset";
import { PasswordField } from "@repo/ui/components/password-field";

const initial: UpdatePasswordState = {};

export function UpdatePasswordForm() {
  return (
    <QueryIsland>
      <UpdatePasswordFields />
    </QueryIsland>
  );
}

function UpdatePasswordFields() {
  const { mutate, isPending: pending, data: mutationResult } =
    useUpdatePassword();
  const state = mutationResult ?? initial;
  useActionToast(state);

  return (
    <form
      action={(formData) => {
        mutate(formData);
      }}
      className="flex flex-col gap-4"
    >
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
