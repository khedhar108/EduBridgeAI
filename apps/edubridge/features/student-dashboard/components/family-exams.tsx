import { FamilyAwaiting } from "./family-awaiting";
import { FamilyPageIntro } from "./family-page-intro";
import type { FamilyExamMark } from "../queries/get-family-academic";

type Props = {
  marks: FamilyExamMark[];
};

export function FamilyExams({ marks }: Props) {
  const periodic = marks.filter((row) => row.type === "periodic");
  const term = marks.filter((row) => row.type === "term");
  const other = marks.filter((row) => row.type === "other");

  return (
    <div className="flex flex-col gap-6">
      <FamilyPageIntro
        title="Exams"
        description="Unit tests, half-yearly, and final marks for this child. Scores appear after the school publishes them."
      />
      <ExamGroup
        title="Unit tests"
        empty="Periodic test marks by subject will list here. There are no test records for this admission number yet."
        rows={periodic}
      />
      <ExamGroup
        title="Half-yearly / term"
        empty="Term results wait on the first assessment the school saves against this class."
        rows={term}
      />
      <ExamGroup
        title="Other assessments"
        empty="Year-end or other marks will replace this note when the school records them."
        rows={other}
      />
    </div>
  );
}

function ExamGroup({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: FamilyExamMark[];
}) {
  if (rows.length === 0) {
    return <FamilyAwaiting title={title}>{empty}</FamilyAwaiting>;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={`${row.assessmentName}-${row.subjectName}-${row.onDate}`}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="text-muted-foreground">
              {row.subjectName} · {row.assessmentName}
            </span>
            <span className="tabular-nums text-foreground">
              {row.score} / {row.maxMarks}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
