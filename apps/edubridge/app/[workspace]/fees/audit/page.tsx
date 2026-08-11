import { withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import { FeesNav, isMoneyRole, listFeeAudit } from "@/features/fees";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function FeeAuditPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !isMoneyRole(ctx.role)) notFound();

  const events = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    (tx) => listFeeAudit(tx, ctx.schoolId),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Fee audit</h1>
        <p className="text-sm text-muted-foreground">
          Append-only history of structure publishes, registrations, and
          payments — who and when.
        </p>
      </div>

      <FeesNav workspace={workspace} active="audit" />

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit events yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {events.map((event) => (
            <li key={event.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{event.action}</span>
                <span className="text-xs text-muted-foreground">
                  {event.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                  {event.actorName ? ` · ${event.actorName}` : ""}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.entityType}
                {event.detail
                  ? ` · ${JSON.stringify(event.detail).slice(0, 180)}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
