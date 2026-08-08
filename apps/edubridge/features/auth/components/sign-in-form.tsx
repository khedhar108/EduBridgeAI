"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { signInAction, type SignInState } from "../actions/sign-in";

const initial: SignInState = {};

type Props = {
  surface: "school" | "platform";
  next?: string;
};

export function SignInForm({ surface, next }: Props) {
  const [state, formAction, pending] = useActionState(signInAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="surface" value={surface} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {surface === "school" ? (
          <>
            Platform operator?{" "}
            <Link
              href="/platform/sign-in"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Platform sign-in
            </Link>
          </>
        ) : (
          <>
            School workspace?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              School sign-in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
