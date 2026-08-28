import { Button } from "@repo/ui/components/button";
import type { AccessibleClass } from "../queries/list-classes";

type Props = {
  workspace: string;
  classes: AccessibleClass[];
  selectedClassId: string;
  onDate: string;
};

export function ClassFilterForm({
  workspace,
  classes,
  selectedClassId,
  onDate,
}: Props) {
  return (
    <form
      method="get"
      action={`/${workspace}/students`}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label htmlFor="class" className="text-sm font-medium">
          Class
        </label>
        <select
          id="class"
          name="class"
          defaultValue={selectedClassId}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        >
          {classes.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name} · {row.section} · {row.academicYear}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={onDate}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        />
      </div>
      <Button type="submit" variant="secondary" className="h-11">
        Show register
      </Button>
    </form>
  );
}
