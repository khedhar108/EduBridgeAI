import type { SchoolStudentRow } from "../queries/fees";

type StudentsPanelProps = {
  students: SchoolStudentRow[];
};

/** Scrollable student roster for the admin dashboard. */
export function StudentsPanel({ students }: StudentsPanelProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Students</h2>
        <p className="text-xs text-muted-foreground">
          {students.length} enrolled
        </p>
      </div>

      <div className="max-h-96 overflow-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 backdrop-blur">
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Adm. No.</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Class</th>
              <th className="px-4 py-2 font-medium">DOB</th>
              <th className="px-4 py-2 font-medium">Guardian</th>
              <th className="px-4 py-2 font-medium">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {s.admissionNumber}
                </td>
                <td className="px-4 py-2.5 font-medium">{s.fullName}</td>
                <td className="px-4 py-2.5">{s.classLabel ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {s.dateOfBirth}
                </td>
                <td className="px-4 py-2.5">
                  {s.guardianName ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {s.guardianPhone ?? s.guardianEmail ?? "—"}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No students registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
