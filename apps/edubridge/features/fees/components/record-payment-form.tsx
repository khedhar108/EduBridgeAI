"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import {
  recordPaymentAction,
  type RecordPaymentState,
} from "../actions/record-payment";

const initial: RecordPaymentState = {};

type AssignmentOption = {
  id: string;
  label: string;
};

type Props = {
  workspace: string;
  assignments: AssignmentOption[];
};

export function RecordPaymentForm({ workspace, assignments }: Props) {
  const bound = recordPaymentAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Register a student with a fee assignment before recording payments.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="assignmentId" className="text-sm font-medium">
          Student fee assignment
        </label>
        <select
          id="assignmentId"
          name="assignmentId"
          required
          disabled={pending}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        >
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="amountInr" className="text-sm font-medium">
            Amount (INR)
          </label>
          <Input
            id="amountInr"
            name="amountInr"
            type="number"
            min={1}
            required
            disabled={pending}
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="method" className="text-sm font-medium">
            Method
          </label>
          <select
            id="method"
            name="method"
            required
            disabled={pending}
            defaultValue="cash"
            className="border-input bg-background h-11 rounded-md border px-3 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reference" className="text-sm font-medium">
          Reference
        </label>
        <Input
          id="reference"
          name="reference"
          disabled={pending}
          className="h-11"
          placeholder="UPI ref / cheque no."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium">
          Note
        </label>
        <Input id="note" name="note" disabled={pending} className="h-11" />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-muted-foreground">Payment recorded.</p>
      ) : null}

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Record payment
      </Button>
    </form>
  );
}
