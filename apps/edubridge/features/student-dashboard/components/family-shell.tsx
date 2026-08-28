import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  MAX_LINKED_STUDENTS,
  type FamilyViewer,
} from "@/lib/tenancy/family-session-token";
import { ChildSwitcher } from "./child-switcher";
import { FamilyNav } from "./family-nav";
import type { FamilyNavItem, FamilyStudentSummary } from "../types";

type Props = {
  workspace: string;
  schoolName: string;
  viewer: FamilyViewer;
  student: FamilyStudentSummary;
  linkedStudents: FamilyStudentSummary[];
  nav: FamilyNavItem[];
  signOutAction: (formData: FormData) => void | Promise<void>;
  switchChildAction: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
};

export function FamilyShell({
  workspace,
  schoolName,
  viewer,
  student,
  linkedStudents,
  nav,
  signOutAction,
  switchChildAction,
  children,
}: Props) {
  const who = viewer === "parent" ? "Parent" : "Student";
  const showSwitcher = viewer === "parent" && linkedStudents.length > 1;
  const canAddChild =
    viewer === "parent" && linkedStudents.length < MAX_LINKED_STUDENTS;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate font-serif text-base font-semibold tracking-tight text-foreground">
                {schoolName}
              </p>
              {showSwitcher ? null : (
                <p className="truncate text-xs text-muted-foreground">
                  <span className="text-foreground">{student.fullName}</span>
                  {" · "}
                  <span className="font-mono tabular-nums">
                    {student.admissionNumber}
                  </span>
                  {" · "}
                  {who}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canAddChild && linkedStudents.length < 2 ? (
                <Button asChild variant="outline" className="h-11">
                  <Link href={`/${workspace}/family/add-child`}>Add child</Link>
                </Button>
              ) : null}
              <form action={signOutAction}>
                <input type="hidden" name="workspace" value={workspace} />
                <Button type="submit" variant="outline" className="h-11">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          {showSwitcher ? (
            <ChildSwitcher
              workspace={workspace}
              activeStudentId={student.id}
              students={linkedStudents}
              canAddChild={canAddChild}
              switchChildAction={switchChildAction}
            />
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</main>
      <FamilyNav workspace={workspace} items={nav} />
    </div>
  );
}
