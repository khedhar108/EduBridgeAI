"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { signInAction, type SignInState } from "../actions/sign-in";
import {
  DEMO_PREFILL_EVENT,
  consumeDemoPrefill,
} from "../lib/demo-accounts";

const initial: SignInState = {};

type Props = {
  surface: "school" | "platform";
  next?: string;
};

const REMEMBER_KEY = "edubridge.remembered-creds";
const REMEMBER_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

type RememberedCreds = {
  email: string;
  password: string;
  expiresAt: number;
};

function readRemembered(): RememberedCreds | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RememberedCreds>;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.password !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(REMEMBER_KEY);
      return null;
    }
    return {
      email: parsed.email,
      password: parsed.password,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

function writeRemembered(email: string, password: string) {
  try {
    localStorage.setItem(
      REMEMBER_KEY,
      JSON.stringify({ email, password, expiresAt: Date.now() + REMEMBER_TTL }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function clearRemembered() {
  try {
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // ignore
  }
}

export function SignInForm({ surface, next }: Props) {
  const [state, formAction, pending] = useActionState(signInAction, initial);
  const [email, setEmail] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const autoLoginRef = useRef(false);
  const autoSubmitRef = useRef(false);

  // Restore credentials (remembered > demo stash) and wire the demo event.
  useEffect(() => {
    const remembered = readRemembered();
    if (remembered) {
      setEmail(remembered.email);
      setPassword(remembered.password);
      setRemember(true);
      autoLoginRef.current = true;
      return;
    }

    const pendingPrefill = consumeDemoPrefill();
    if (pendingPrefill) {
      setEmail(pendingPrefill.email);
      setPassword(pendingPrefill.password);
    }

    const onPrefill = (event: Event) => {
      const detail = (event as CustomEvent<{ email: string; password: string }>)
        .detail;
      if (detail) {
        setEmail(detail.email);
        setPassword(detail.password);
      }
    };
    window.addEventListener(DEMO_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(DEMO_PREFILL_EVENT, onPrefill);
  }, []);

  // Auto-submit once when credentials were restored from "remember me",
  // so returning users skip the manual sign-in.
  useEffect(() => {
    if (
      autoLoginRef.current &&
      email &&
      password &&
      !autoSubmitRef.current &&
      !pending
    ) {
      autoSubmitRef.current = true;
      const id = setTimeout(() => formRef.current?.requestSubmit(), 60);
      return () => clearTimeout(id);
    }
  }, [email, password, pending]);

  // A stored credential that fails (e.g. password changed) shouldn't loop:
  // drop it so the next visit lands on a clean form.
  useEffect(() => {
    if (state.error && autoLoginRef.current && autoSubmitRef.current) {
      clearRemembered();
      autoLoginRef.current = false;
      autoSubmitRef.current = false;
    }
  }, [state.error]);

  const onSubmit = () => {
    if (remember) {
      writeRemembered(email, password);
    } else {
      clearRemembered();
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="surface" value={surface} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {surface === "school" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="schoolSlug" className="text-sm font-medium text-foreground">
            School
          </label>
          <Input
            id="schoolSlug"
            name="schoolSlug"
            type="text"
            autoComplete="organization"
            placeholder="e.g. edubridge-pilot-bridge"
            className="h-11"
            disabled={pending}
            value={schoolSlug}
            onChange={(event) => setSchoolSlug(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Required only when signing in with a username.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email or username
        </label>
        <Input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          className="h-11"
          disabled={pending}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            className="h-11 pr-10"
            disabled={pending}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="size-4 rounded border-input accent-primary"
        />
        Remember me for 7 days
      </label>

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
