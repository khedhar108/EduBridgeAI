import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { AuthHeader } from "./auth-header";
import { workspaceSignInHref } from "../lib/redirects";

export function WorkspaceHowAreYou({
  workspace,
  schoolName,
  next,
}: {
  workspace: string;
  schoolName: string;
  next?: string;
}) {
  return (
    <>
      <AuthHeader title={schoolName} description="How are you?" />
      <div className="flex flex-col gap-3">
        <Button asChild variant="outline" className="h-auto min-h-11 w-full justify-start py-3">
          <Link href={workspaceSignInHref(workspace, { who: "school", next })}>
            <span className="flex flex-col items-start gap-0.5 text-left">
              <span className="font-medium">School</span>
              <span className="text-xs font-normal text-muted-foreground">
                Admin, teacher, staff, accountant, coordinator
              </span>
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto min-h-11 w-full justify-start py-3">
          <Link href={workspaceSignInHref(workspace, { who: "family" })}>
            <span className="flex flex-col items-start gap-0.5 text-left">
              <span className="font-medium">Parent or student</span>
              <span className="text-xs font-normal text-muted-foreground">
                Admission number and date of birth
              </span>
            </span>
          </Link>
        </Button>
      </div>
    </>
  );
}
