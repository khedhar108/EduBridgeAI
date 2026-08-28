"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import {
  acceptInviteAction,
  type AcceptInviteState,
} from "../actions/accept-invite";
import { UsernameField } from "./username-field";
import { suggestUsername } from "../lib/username";

const initial: AcceptInviteState = {};

type Props = {
  token: string;
  email: string;
  schoolName: string;
  schoolSlug: string;
  role: string;
};

export function AcceptInviteForm({ token, email, schoolName, schoolSlug, role }: Props) {
  const bound = acceptInviteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Join <span className="font-medium text-foreground">{schoolName}</span> as{" "}
        <span className="font-medium text-foreground">
          {role.replace("_", " ")}
        </span>
        .
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          readOnly
          className="h-11 bg-muted"
        />
      </div>

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

      <UsernameField
        suggested={suggestUsername(email)}
        schoolSlug={schoolSlug}
        disabled={pending}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
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

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Accept invitation
      </Button>
    </form>
  );
}
