"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@repo/ui/components/input";

type Props = {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete = "new-password",
  disabled,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          className="h-11 pr-10"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
