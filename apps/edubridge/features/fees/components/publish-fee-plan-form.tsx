"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import {
  publishFeePlanAction,
  type PublishFeePlanState,
} from "../actions/publish-fee-plan";

const initial: PublishFeePlanState = {};

const defaultHeads = JSON.stringify(
  [
    { code: "registration", label: "Registration", amountInr: 5000 },
    { code: "tuition", label: "Tuition", amountInr: 30000 },
  ],
  null,
  2,
);

type Props = {
  workspace: string;
  planId?: string;
  defaultName?: string;
  defaultClassLabel?: string;
  defaultPaymentMode?: "once" | "quarterly" | "custom";
  defaultHeadsJson?: string;
};

export function PublishFeePlanForm({
  workspace,
  planId,
  defaultName = "",
  defaultClassLabel = "",
  defaultPaymentMode = "once",
  defaultHeadsJson = defaultHeads,
}: Props) {
  const bound = publishFeePlanAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {planId ? <input type="hidden" name="planId" value={planId} /> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Plan name
        </label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          disabled={pending}
          className="h-11"
          placeholder="Class 1 — 2026-27"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="classLabel" className="text-sm font-medium">
          Class label
        </label>
        <Input
          id="classLabel"
          name="classLabel"
          defaultValue={defaultClassLabel}
          disabled={pending}
          className="h-11"
          placeholder="Class 1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="paymentMode" className="text-sm font-medium">
          Payment mode
        </label>
        <select
          id="paymentMode"
          name="paymentMode"
          required
          disabled={pending}
          defaultValue={defaultPaymentMode}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        >
          <option value="once">At once</option>
          <option value="quarterly">Quarterly (3 months)</option>
          <option value="custom">Custom heads</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="headsJson" className="text-sm font-medium">
          Fee heads (JSON)
        </label>
        <textarea
          id="headsJson"
          name="headsJson"
          required
          disabled={pending}
          defaultValue={defaultHeadsJson}
          rows={8}
          className="border-input bg-background rounded-md border px-3 py-2 font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Publishing creates a new immutable version. Students already
          registered keep their old version.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium">
          Change note
        </label>
        <Input
          id="note"
          name="note"
          disabled={pending}
          className="h-11"
          placeholder="Why this version changed"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-muted-foreground">Fee plan version published.</p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Publish version
      </Button>
    </form>
  );
}
