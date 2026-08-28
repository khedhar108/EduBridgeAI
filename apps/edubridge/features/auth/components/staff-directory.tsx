import {
  startImpersonationAction,
  toggleMemberActiveAction,
  type MemberDirectoryEntry,
} from "../index";

type StaffDirectoryProps = {
  workspace: string;
  members: MemberDirectoryEntry[];
  currentUserId: string;
  currentRole: string;
};

function roleLabel(role: string): string {
  return role.replace(/_/g, " ");
}

const PROTECTED_ROLES = ["school_admin", "coordinator"];

export function StaffDirectory({
  workspace,
  members,
  currentUserId,
  currentRole,
}: StaffDirectoryProps) {
  const isAdmin = currentRole === "school_admin";
  const isManager = isAdmin || currentRole === "coordinator";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Staff directory</h2>
        <p className="text-xs text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => {
              const isSelf = m.userId === currentUserId;
              const isProtected = PROTECTED_ROLES.includes(m.role);
              const canManage = isManager && !isSelf && (isAdmin || !isProtected);
              const canImpersonate = isAdmin && !isSelf && !isProtected && m.isActive;

              return (
                <tr key={m.userId} className="items-center">
                  <td className="px-4 py-3 font-medium">{m.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{roleLabel(m.role)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        m.isActive
                          ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {canImpersonate && (
                        <form
                          action={startImpersonationAction.bind(null, workspace)}
                        >
                          <input
                            type="hidden"
                            name="targetUserId"
                            value={m.userId}
                          />
                          <button
                            type="submit"
                            className="text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
                          >
                            Login as
                          </button>
                        </form>
                      )}
                      {canManage && (
                        <form
                          action={toggleMemberActiveAction.bind(null, workspace)}
                        >
                          <input
                            type="hidden"
                            name="targetUserId"
                            value={m.userId}
                          />
                          <input
                            type="hidden"
                            name="action"
                            value={m.isActive ? "deactivate" : "activate"}
                          />
                          <button
                            type="submit"
                            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:no-underline"
                          >
                            {m.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      )}
                      {!canManage && !canImpersonate && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
