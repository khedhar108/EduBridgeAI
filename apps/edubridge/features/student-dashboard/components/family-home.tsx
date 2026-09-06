import type { FamilyViewer } from "@/lib/tenancy/family-session";
import { FamilyDestinationGrid } from "./family-destination-grid";
import type {
  FamilyFeeHint,
  FamilyNavItem,
  FamilyStudentSummary,
} from "../types";

type Props = {
  workspace: string;
  viewer: FamilyViewer;
  student: FamilyStudentSummary;
  destinations: FamilyNavItem[];
  feeHint?: FamilyFeeHint;
};

export function FamilyHome({
  workspace,
  viewer,
  student,
  destinations,
  feeHint,
}: Props) {
  const who = viewer === "parent" ? "Parent view" : "Student view";
  const firstName = student.fullName.split(" ")[0] ?? student.fullName;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">{who}</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          Hello, {firstName}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {student.fullName}
          {student.classLabel ? ` · ${student.classLabel}` : null}
          {" · "}
          <span className="font-mono tabular-nums">
            {student.admissionNumber}
          </span>
        </p>
      </div>
      <FamilyDestinationGrid
        workspace={workspace}
        items={destinations}
        feeHint={feeHint}
      />
    </div>
  );
}
