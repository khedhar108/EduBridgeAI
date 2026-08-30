import { notFound } from "next/navigation";
import { InfoHint } from "@repo/ui/components/info-hint";
import { ControlHubMatrix } from "@/features/auth";
import { ROLE_SUMMARIES } from "@/features/auth/lib/role-copy";
import { buildHubMatrix, can, HUB_ROLES } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function ControlHubPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "control.view")) {
    notFound();
  }

  const groups = buildHubMatrix(ctx.capabilityOverrides);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Control Hub</h1>
          <InfoHint label="About Control Hub" title="Permission flags">
            Each switch is a capability for a role. School admin is always on.
            Turning on a permission a role does not have by default asks for
            confirmation first.
          </InfoHint>
        </div>
        <p className="text-sm text-muted-foreground">
          Default-on switches save immediately. Grants outside a role default
          confirm first. Who recorded a payment is already on the Fees audit
          trail.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Role defaults</h2>
        <ul className="divide-y divide-border rounded-md border border-border">
          {HUB_ROLES.map((role) => (
            <li key={role} className="px-4 py-3 text-sm">
              <p className="font-medium capitalize">{role.replace(/_/g, " ")}</p>
              <p className="mt-1 text-muted-foreground">
                {ROLE_SUMMARIES[role]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <ControlHubMatrix workspace={workspace} groups={groups} />
    </div>
  );
}
