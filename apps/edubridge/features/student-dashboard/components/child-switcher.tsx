"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import type { FamilyStudentSummary } from "../types";

type Props = {
  workspace: string;
  activeStudentId: string;
  students: FamilyStudentSummary[];
  canAddChild: boolean;
  switchChildAction: (formData: FormData) => void | Promise<void>;
};

export function ChildSwitcher({
  workspace,
  activeStudentId,
  students,
  canAddChild,
  switchChildAction,
}: Props) {
  const addHref = `/${workspace}/family/add-child`;
  const addButton = canAddChild ? (
    <Button asChild variant="outline" className="h-11 shrink-0">
      <Link href={addHref}>Add child</Link>
    </Button>
  ) : null;

  if (students.length < 2) {
    return addButton;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <form action={switchChildAction} className="min-w-0 flex-1">
        <input type="hidden" name="workspace" value={workspace} />
        <label htmlFor="family-child" className="sr-only">
          Child
        </label>
        <select
          id="family-child"
          name="studentId"
          defaultValue={activeStudentId}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          {students.map((child) => (
            <option key={child.id} value={child.id}>
              {child.fullName}
              {child.classLabel ? ` · ${child.classLabel}` : ""}
            </option>
          ))}
        </select>
      </form>
      {addButton}
    </div>
  );
}
