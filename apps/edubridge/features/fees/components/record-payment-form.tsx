"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { QueryIsland } from "@/lib/query/island";
import type { RecordPaymentState } from "../actions/record-payment";
import { useRecordPayment } from "../hooks/use-record-payment";

const initial: RecordPaymentState = {};

type AssignmentOption = {
  id: string;
  label: string;
};

type Props = {
  workspace: string;
  schoolId?: string;
  userId?: string;
  assignments: AssignmentOption[];
};

export function RecordPaymentForm(props: Props) {
  return (
    <QueryIsland>
      <RecordPaymentFields {...props} />
    </QueryIsland>
  );
}

function RecordPaymentFields({
  workspace,
  schoolId,
  userId,
  assignments,
}: Props) {
  const { mutate, isPending, data: mutationResult } = useRecordPayment(
    workspace,
    schoolId,
    userId,
  );
  useActionToast(mutationResult ?? initial, "Payment recorded.");

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Register a student with a fee assignment before recording payments.
      </p>
    );
  }

  return (
    <form
      action={(formData) => {
        mutate(formData);
      }}
      className="flex max-w-xl flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="assignmentId" className="text-sm font-medium">
          Student fee assignment
        </label>
        <select
          id="assignmentId"
          name="assignmentId"
          required
          disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
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
          disabled={isPending}
          className="h-11"
          placeholder="UPI ref / cheque no."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium">
          Note
        </label>
        <Input id="note" name="note" disabled={isPending} className="h-11" />
      </div>

      <Button type="submit" className="h-11" disabled={isPending}>
        {isPending ? <Spinner className="size-4" /> : null}
        Record payment
      </Button>
    </form>
  );
}
