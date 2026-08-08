import { and, eq, membershipRequests, profiles, withTenant } from "@repo/db";
import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { InviteMemberForm, PendingMembersPanel } from "@/features/auth";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function TeamSettingsPage({ params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx || ctx.role !== "school_admin") {
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
          Activate staff who joined with your school email domain, or send
          invite links. Role is always set by an admin.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Pending domain joins</h2>
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

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Invite by email</h2>
        <p className="text-sm text-muted-foreground">
          For students, parents, or anyone without a school-domain inbox.
        </p>
        <InviteMemberForm workspace={workspace} />
      </section>
    </div>
  );
}
