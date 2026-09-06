"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { InfoHint } from "@repo/ui/components/info-hint";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { QueryIsland } from "@/lib/query/island";
import type { ProvisionMemberState } from "../actions/provision-member";
import { useProvisionMember } from "../hooks/use-provision-member";
import { provisionRoles } from "../lib/schemas";
import { suggestUsername } from "../lib/username";
import { PasswordField } from "@repo/ui/components/password-field";
import { UsernameField } from "./username-field";

const initial: ProvisionMemberState = {};

const ROLE_LABELS: Record<(typeof provisionRoles)[number], string> = {
  coordinator: "Coordinator",
  teacher: "Teacher",
  staff: "Staff",
  accountant: "Accountant",
};

type Props = {
  workspace: string;
  schoolId?: string;
  userId?: string;
  currentRole: string;
  onSuccess?: () => void;
};

export function ProvisionMemberForm(props: Props) {
  return (
    <QueryIsland>
      <ProvisionMemberFields {...props} />
    </QueryIsland>
  );
}

function ProvisionMemberFields({
  workspace,
  schoolId,
  userId,
  currentRole,
  onSuccess,
}: Props) {
  const { mutate, isPending: pending, data: mutationResult } = useProvisionMember(
    workspace,
    schoolId,
    userId,
  );
  const state = mutationResult ?? initial;
  const [email, setEmail] = useState("");
  useActionToast(state, "Account created. Give them the username and password.");

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state.ok, onSuccess]);

  const roles =
    currentRole === "coordinator"
      ? provisionRoles.filter((role) => role !== "coordinator")
      : provisionRoles;

  return (
    <form
      action={(formData) => {
        mutate(formData);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          minLength={2}
          className="h-11"
          disabled={pending}
        />
      </div>

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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <UsernameField
        suggested={suggestUsername(email)}
        schoolSlug={workspace}
        disabled={pending}
      />

      <PasswordField id="password" name="password" label="Password" disabled={pending} />
      <PasswordField
        id="passwordConfirm"
        name="passwordConfirm"
        label="Confirm password"
        disabled={pending}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <InfoHint label="What this role grants" title="Role">
            Staff accounts only. Students and parents use admission number and
            date of birth. School admin cannot be created here. Coordinator
            manages people but not fees.
          </InfoHint>
        </div>
        <select
          id="role"
          name="role"
          required
          disabled={pending}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
          defaultValue="teacher"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Create account
      </Button>
    </form>
  );
}
