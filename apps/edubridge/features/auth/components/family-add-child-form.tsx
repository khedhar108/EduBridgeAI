"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  familyAddChildAction,
  type FamilyAddChildState,
} from "../actions/add-child";

const initial: FamilyAddChildState = {};

type Props = {
  workspace: string;
  schoolName: string;
};

export function FamilyAddChildForm({ workspace, schoolName }: Props) {
  const [state, formAction, pending] = useActionState(
    familyAddChildAction,
    initial,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="workspace" value={workspace} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="admissionNumber"
          className="text-sm font-medium text-foreground"
        >
          Admission number
        </label>
        <Input
          id="admissionNumber"
          name="admissionNumber"
          type="text"
          autoComplete="off"
          required
          maxLength={64}
          className="h-11"
          disabled={pending}
          placeholder="EBS2024007"
        />
        <p className="text-xs text-muted-foreground">
          This child’s admission number. Hyphens and spaces are optional.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="dateOfBirth"
          className="text-sm font-medium text-foreground"
        >
          Student date of birth
        </label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          required
          className="h-11"
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          Enter another child enrolled at {schoolName}. Same proof as the
          family door.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Add child
      </Button>

      {process.env.NODE_ENV !== "production" ? (
        <p className="text-xs text-muted-foreground">
          Local seed: EBS-2024-007, 2012-07-07 (Arjun Gupta).
        </p>
      ) : null}
    </form>
  );
}
