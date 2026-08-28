"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  recordClassActivityAction,
  type RecordClassActivityState,
} from "../actions/record-class-activity";

const initial: RecordClassActivityState = {};

type Props = {
  workspace: string;
  classId: string;
  occurredOn: string;
};

export function ClassActivityForm({ workspace, classId, occurredOn }: Props) {
  const bound = recordClassActivityAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);
  useActionToast(state, "Class event posted.");

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="classId" value={classId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="occurredOn" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="occurredOn"
            name="occurredOn"
            type="date"
            required
            defaultValue={occurredOn}
            disabled={pending}
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Input
            id="category"
            name="category"
            required
            minLength={2}
            maxLength={64}
            placeholder="Holiday, circular, function"
            disabled={pending}
            className="h-11"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium">
          Note
        </label>
        <textarea
          id="note"
          name="note"
          required
          minLength={2}
          maxLength={4000}
          rows={3}
          disabled={pending}
          className="border-input bg-background min-h-20 rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-fit">
        {pending ? <Spinner className="size-4" /> : null}
        Post class event
      </Button>
    </form>
  );
}
