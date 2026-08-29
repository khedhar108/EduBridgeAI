"use client";

import { useActionState, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  schoolDomainSignUpAction,
  type SchoolDomainSignUpState,
} from "../actions/school-domain-sign-up";
import { UsernameField } from "./username-field";
import { suggestUsername } from "../lib/username";
import { TermsAcceptCheckbox } from "./terms-accept-checkbox";

const initial: SchoolDomainSignUpState = {};

export function SchoolDomainSignUpForm() {
  const [state, formAction, pending] = useActionState(
    schoolDomainSignUpAction,
    initial,
  );
  useActionToast(state);
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Use your official school email. Access stays pending until a school
        admin activates you from the team dashboard.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <Input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          className="h-11"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          School email
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

      <UsernameField suggested={suggestUsername(email)} disabled={pending} />

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

      <TermsAcceptCheckbox disabled={pending} />

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Request school access
      </Button>
    </form>
  );
}
