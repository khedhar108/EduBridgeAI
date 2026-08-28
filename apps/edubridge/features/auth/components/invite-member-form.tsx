"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import {
  inviteMemberAction,
  type InviteMemberState,
} from "../actions/invite-member";

const initial: InviteMemberState = {};

const roles = [
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
  { value: "accountant", label: "Accountant" },
  { value: "school_admin", label: "School admin" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
] as const;

type Props = {
  workspace: string;
};

export function InviteMemberForm({ workspace }: Props) {
  const bound = inviteMemberAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="h-11"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          disabled={pending}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
          defaultValue="teacher"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.inviteUrl ? (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="mb-2 font-medium">Invitation created</p>
          <p className="mb-2 text-muted-foreground">
            Share this link (email delivery comes later). Expires in 7 days.
          </p>
          <code className="block break-all text-xs">{state.inviteUrl}</code>
        </div>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Create invitation
      </Button>
    </form>
  );
}
