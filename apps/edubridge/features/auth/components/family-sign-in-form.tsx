"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  familySignInAction,
  type FamilySignInState,
} from "../actions/family-sign-in";

const initial: FamilySignInState = {};

type Props = {
  workspace: string;
  schoolName: string;
};

export function FamilySignInForm({ workspace, schoolName }: Props) {
  const [state, formAction, pending] = useActionState(
    familySignInAction,
    initial,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="workspace" value={workspace} />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">I am</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            name="viewer"
            value="parent"
            defaultChecked
            disabled={pending}
            className="size-4 accent-primary"
          />
          A parent or guardian
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            name="viewer"
            value="student"
            disabled={pending}
            className="size-4 accent-primary"
          />
          A student
        </label>
      </fieldset>

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
        />
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
          Use the student’s date of birth for {schoolName}. Parents enter a
          child’s details.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Continue
      </Button>

      {process.env.NODE_ENV !== "production" ? (
        <p className="text-xs text-muted-foreground">
          Local seed: EBS-2024-006, 2013-06-06 (Reyansh).
        </p>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Staff?{" "}
        <Link
          href={`/${workspace}/sign-in`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Staff sign-in
        </Link>
      </p>
    </form>
  );
}
