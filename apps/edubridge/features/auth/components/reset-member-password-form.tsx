"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  resetMemberPasswordAction,
  type ResetMemberPasswordState,
} from "../actions/reset-member-password";
import { PasswordField } from "./password-field";

const initial: ResetMemberPasswordState = {};

type Props = {
  workspace: string;
  targetUserId: string;
  memberName: string;
  onSuccess?: () => void;
};

export function ResetMemberPasswordForm({
  workspace,
  targetUserId,
  memberName,
  onSuccess,
}: Props) {
  const bound = resetMemberPasswordAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);
  useActionToast(state, `Password updated for ${memberName}`);

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <PasswordField
        id={`reset-password-${targetUserId}`}
        name="password"
        label="New password"
        disabled={pending}
      />
      <PasswordField
        id={`reset-password-confirm-${targetUserId}`}
        name="passwordConfirm"
        label="Confirm password"
        disabled={pending}
      />
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Save password
      </Button>
    </form>
  );
}
