import { and, eq, membershipRequests, profiles, withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { can } from "@/lib/auth/capabilities";
import { InfoHint } from "@repo/ui/components/info-hint";
import { PendingMembersPanel } from "@/features/auth";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function TeamSettingsPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "team.view")) {
    notFound();
  }

  const pending = await withTenant(
    {
      sub: ctx.userId,
      school_id: ctx.schoolId,
      role: ctx.role,
    },
    async (tx) => {
      return tx
        .select({
          id: membershipRequests.id,
          email: membershipRequests.email,
          fullName: profiles.fullName,
          createdAt: membershipRequests.createdAt,
        })
        .from(membershipRequests)
        .innerJoin(profiles, eq(membershipRequests.userId, profiles.id))
        .where(
          and(
            eq(membershipRequests.schoolId, ctx.schoolId),
            eq(membershipRequests.status, "pending"),
          ),
        );
    },
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Activate staff who joined with your school email domain. New staff
          without a school-domain inbox are added from the staff directory
          with a username and password.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-medium">Pending domain joins</h2>
          <InfoHint label="About pending joins" title="Domain joins">
            Staff who signed up with your school email. Activate sets their
            role. Reject leaves them without access.
          </InfoHint>
        </div>
        <PendingMembersPanel
          workspace={workspace}
          requests={pending.map((row) => ({
            id: row.id,
            email: row.email,
            fullName: row.fullName,
            createdAt: row.createdAt.toISOString().slice(0, 10),
          }))}
        />
      </section>
    </div>
  );
}
