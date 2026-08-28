import { FamilyAwaiting } from "./family-awaiting";
import { FamilyPageIntro } from "./family-page-intro";
import type { FamilyEvent } from "../queries/get-family-academic";

type Props = {
  events: FamilyEvent[];
};

export function FamilyEvents({ events }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <FamilyPageIntro
        title="Events"
        description="Functions, holidays, and circulars that apply to this child’s class."
      />
      {events.length === 0 ? (
        <FamilyAwaiting title="School calendar">
          When the school posts an event or circular, it will show here with the
          date. Nothing is listed until staff publish it.
        </FamilyAwaiting>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
            >
              <p className="text-sm font-medium">
                {event.category}
                <span className="ml-2 font-normal text-muted-foreground">
                  {event.occurredOn}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {event.note}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
