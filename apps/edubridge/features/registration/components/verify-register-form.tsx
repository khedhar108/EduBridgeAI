"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { QueryIsland } from "@/lib/query/island";
import type { VerifyRegisterState } from "../actions/register-school";
import {
  useResendRegisterOtp,
  useVerifyRegisterOtp,
} from "../hooks/use-verify-register";

const initial: VerifyRegisterState = {};

export function VerifyRegisterForm({ email }: { email: string }) {
  return (
    <QueryIsland>
      <VerifyRegisterFields email={email} />
    </QueryIsland>
  );
}

function VerifyRegisterFields({ email }: { email: string }) {
  const {
    mutate: verify,
    isPending: verifyPending,
    data: verifyResult,
  } = useVerifyRegisterOtp();
  const {
    mutate: resend,
    isPending: resendPending,
    data: resendResult,
  } = useResendRegisterOtp();
  const verifyState = verifyResult ?? initial;
  const resendState = resendResult ?? initial;
  useActionToast(verifyState);
  useActionToast(resendState, "Code sent. Check your school inbox.");

  const pending = verifyPending || resendPending;

  return (
    <div className="flex flex-col gap-4">
      <form
        action={(formData) => {
          verify(formData);
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-2">
          <label htmlFor="token" className="text-sm font-medium">
            6-digit code
          </label>
          <Input
            id="token"
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={6}
            maxLength={8}
            className="h-11 tracking-[0.3em]"
            disabled={pending}
          />
        </div>
        {verifyState.error ? (
          <p className="text-sm text-destructive">{verifyState.error}</p>
        ) : null}
        <Button type="submit" className="h-11" disabled={pending}>
          {verifyPending ? <Spinner className="size-4" /> : null}
          Verify and open workspace
        </Button>
      </form>
      <form
        action={(formData) => {
          resend(formData);
        }}
      >
        <input type="hidden" name="email" value={email} />
        <Button
          type="submit"
          variant="ghost"
          className="h-11 w-full"
          disabled={pending}
        >
          {resendPending ? <Spinner className="size-4" /> : null}
          Resend code
        </Button>
      </form>
    </div>
  );
}
