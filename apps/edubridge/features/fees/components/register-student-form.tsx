"use client";

import { useActionState, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  registerStudentAction,
  type RegisterStudentState,
} from "../actions/register-student";
import { formatInr, payableInr } from "../lib/money";

const initial: RegisterStudentState = {};

type PlanVersionOption = {
  id: string;
  label: string;
  totalAmountInr: number;
};

type Props = {
  workspace: string;
  planVersions: PlanVersionOption[];
};

export function RegisterStudentForm({ workspace, planVersions }: Props) {
  const bound = registerStudentAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);
  useActionToast(state, "Student registered.");
  const [planVersionId, setPlanVersionId] = useState(planVersions[0]?.id ?? "");
  const [concessionPercent, setConcessionPercent] = useState(0);

  const selected = planVersions.find((v) => v.id === planVersionId);
  const net = selected
    ? payableInr(selected.totalAmountInr, concessionPercent)
    : 0;

  if (planVersions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Publish a fee plan version first, then register students against it.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="admissionNumber" className="text-sm font-medium">
            Admission number
          </label>
          <Input
            id="admissionNumber"
            name="admissionNumber"
            required
            disabled={pending}
            className="h-11 font-mono"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="dateOfBirth" className="text-sm font-medium">
            Date of birth
          </label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            disabled={pending}
            className="h-11"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Student name
        </label>
        <Input
          id="fullName"
          name="fullName"
          required
          disabled={pending}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="classLabel" className="text-sm font-medium">
          Class
        </label>
        <Input
          id="classLabel"
          name="classLabel"
          disabled={pending}
          className="h-11"
          placeholder="Class 1-A"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="guardianName" className="text-sm font-medium">
            Guardian name
          </label>
          <Input
            id="guardianName"
            name="guardianName"
            required
            disabled={pending}
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="guardianRelationship"
            className="text-sm font-medium"
          >
            Relationship
          </label>
          <Input
            id="guardianRelationship"
            name="guardianRelationship"
            required
            disabled={pending}
            className="h-11"
            placeholder="Father / Mother / Guardian"
            defaultValue="Father"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="guardianPhone" className="text-sm font-medium">
          Guardian phone
        </label>
        <Input
          id="guardianPhone"
          name="guardianPhone"
          disabled={pending}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="planVersionId" className="text-sm font-medium">
          Fee plan version
        </label>
        <select
          id="planVersionId"
          name="planVersionId"
          required
          disabled={pending}
          value={planVersionId}
          onChange={(event) => setPlanVersionId(event.target.value)}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        >
          {planVersions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          This version is pinned. Later structure publishes do not change this
          family&apos;s bill.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="concessionPercent" className="text-sm font-medium">
            Scholarship %
          </label>
          <Input
            id="concessionPercent"
            name="concessionPercent"
            type="number"
            min={0}
            max={100}
            value={concessionPercent}
            disabled={pending}
            className="h-11"
            onChange={(event) =>
              setConcessionPercent(
                Math.min(100, Math.max(0, Math.floor(Number(event.target.value) || 0))),
              )
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="concessionNote" className="text-sm font-medium">
            Scholarship note
          </label>
          <Input
            id="concessionNote"
            name="concessionNote"
            disabled={pending}
            className="h-11"
          />
        </div>
      </div>

      <p className="text-sm">
        Payable after scholarship:{" "}
        <span className="font-medium tabular-nums">{formatInr(net)}</span>
        <span className="text-muted-foreground">
          {" "}
          — not retroactive for students already billed.
        </span>
      </p>

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Register student
      </Button>
    </form>
  );
}
