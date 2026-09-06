"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useUsernameCheck } from "../hooks/use-username-check";
import {
  sanitizeUsernameInput,
  validateUsername,
} from "../lib/username";

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

type Props = {
  /** Deterministic prefill (e.g. from the email local part) — applied until the user types. */
  suggested?: string;
  /** School slug — username uniqueness is per-school. Empty = format-only check (e.g. domain-join, where uniqueness is deferred to activation). */
  schoolSlug?: string;
  disabled?: boolean;
};

/**
 * Username picker with live per-school availability: one debounced (400ms)
 * DB query after typing stops, rendered as a green check / red cross inline.
 * The server re-validates at submit; the unique index is the backstop.
 */
export function UsernameField({ suggested, schoolSlug, disabled }: Props) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const { data, isFetching, isError, error, debounced } = useUsernameCheck(
    value,
    schoolSlug,
  );

  useEffect(() => {
    if (!touched && suggested) {
      setValue(sanitizeUsernameInput(suggested));
    }
  }, [suggested, touched]);

  const formatError = value ? validateUsername(value) : null;
  const waitingOnDebounce = value !== debounced;
  const status: Status = !value
    ? "idle"
    : formatError
      ? "invalid"
      : waitingOnDebounce || isFetching
        ? "checking"
        : isError
          ? "invalid"
          : !schoolSlug
            ? "available"
            : data?.available
              ? "available"
              : data
                ? "taken"
                : "checking";

  const reason =
    status === "invalid"
      ? (formatError ?? error?.message ?? "Could not check username.")
      : status === "taken"
        ? (data?.reason ?? "Pick another username.")
        : null;

  const hintColor =
    status === "available"
      ? "text-emerald-600"
      : status === "taken" || status === "invalid"
        ? "text-destructive"
        : "text-muted-foreground";

  const hintText =
    status === "idle"
      ? "Lowercase letters, numbers, dots, dashes. You'll use this to sign in."
      : status === "checking"
        ? "Checking availability…"
        : status === "available"
          ? `"${value}" is available.`
          : (reason ?? "Pick another username.");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="username" className="text-sm font-medium">
        Username
      </label>
      <div className="relative">
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={64}
          className="h-11 pr-10"
          disabled={disabled}
          value={value}
          onChange={(event) => {
            setTouched(true);
            setValue(sanitizeUsernameInput(event.target.value));
          }}
          aria-invalid={status === "taken" || status === "invalid"}
        />
        <span
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-hidden="true"
        >
          {status === "checking" ? (
            <Spinner className="size-4 text-muted-foreground" />
          ) : status === "available" ? (
            <Check className="size-4 text-emerald-600" />
          ) : status === "taken" || status === "invalid" ? (
            <X className="size-4 text-destructive" />
          ) : null}
        </span>
      </div>
      {value ? (
        <p className={`text-xs ${hintColor}`} role="status">
          {hintText}
        </p>
      ) : null}
    </div>
  );
}
