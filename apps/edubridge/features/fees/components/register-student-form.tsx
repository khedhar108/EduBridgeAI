"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  registerStudentAction,
  type RegisterStudentState,
} from "../actions/register-student";

const initial: RegisterStudentState = {};

type PlanVersionOption = {
  id: string;
  label: string;
};

type Props = {
  workspace: string;
  planVersions: PlanVersionOption[];
};

export function RegisterStudentForm({ workspace, planVersions }: Props) {
  const bound = registerStudentAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);
  useActionToast(state, "Student registered.");

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
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        >
          {planVersions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
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
            defaultValue={0}
            disabled={pending}
            className="h-11"
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

      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Register student
      </Button>
    </form>
  );
}
