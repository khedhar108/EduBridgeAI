"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { InfoHint } from "@repo/ui/components/info-hint";
import { cn } from "@repo/ui/lib/utils";
import { Switch } from "@repo/ui/components/switch";
import { notifyAction } from "@repo/ui/hooks/use-action-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { archiveMemberAction } from "../actions/archive-member";
import { changeMemberRoleAction } from "../actions/change-member-role";
import { startImpersonationAction } from "../actions/impersonate";
import { toggleMemberActiveAction } from "../actions/toggle-member-active";
import { ROLE_SUMMARIES } from "../lib/role-copy";
import { grantableRoles } from "../lib/schemas";
import type { MemberDirectoryEntry } from "../queries/list-members";
import { ProvisionMemberForm } from "./provision-member-form";
import { ResetMemberPasswordForm } from "./reset-member-password-form";

type StaffDirectoryProps = {
  workspace: string;
  members: MemberDirectoryEntry[];
  currentUserId: string;
  currentRole: string;
  canProvision: boolean;
};

function roleLabel(role: string): string {
  return role.replace(/_/g, " ");
}

const PROTECTED_ROLES = ["school_admin", "coordinator"];

function HeaderHint({
  text,
  label,
  title,
  hint,
}: {
  text: string;
  label: string;
  title: string;
  hint: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {text}
      <InfoHint label={label} title={title} side="bottom">
        {hint}
      </InfoHint>
    </span>
  );
}

export function StaffDirectory({
  workspace,
  members,
  currentUserId,
  currentRole,
  canProvision,
}: StaffDirectoryProps) {
  const isAdmin = currentRole === "school_admin";
  const isManager = isAdmin || currentRole === "coordinator";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-medium">Staff directory</h2>
          <InfoHint label="About the staff directory" title="Staff directory">
            People with a login to this school. Inactive pauses access and can
            be turned back on. Archive removes access permanently.
          </InfoHint>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
          {canProvision ? (
            <AddMemberDialog workspace={workspace} currentRole={currentRole} />
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">
                <HeaderHint
                  text="Role"
                  label="What roles mean"
                  title="Roles"
                  hint="School admin cannot be granted here. Coordinator manages people, not fees. Role changes ask for confirmation first."
                />
              </th>
              <th className="px-4 py-2 font-medium">
                <HeaderHint
                  text="Status"
                  label="What status means"
                  title="Status"
                  hint="Active can sign in. Inactive is paused and can be restored. Archived is permanent offboarding."
                />
              </th>
              <th className="px-4 py-2 font-medium text-right">
                <span className="inline-flex items-center justify-end gap-0.5">
                  Actions
                  <InfoHint
                    label="What these actions do"
                    title="Actions"
                    side="bottom"
                    align="end"
                  >
                    The switch pauses or restores access. Reset password is
                    for the office when someone forgets their login. Login as
                    lets an admin view the workspace as that person. Archive
                    greys the row and permanently removes access.
                  </InfoHint>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <MemberRow
                key={m.userId}
                workspace={workspace}
                member={m}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                isManager={isManager}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddMemberDialog({
  workspace,
  currentRole,
}: {
  workspace: string;
  currentRole: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a member</DialogTitle>
          <DialogDescription>
            Creates their login now. Give them the username and password. They
            do not set a password themselves. School admin cannot be created
            here.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ProvisionMemberForm
            workspace={workspace}
            currentRole={currentRole}
            onSuccess={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({
  workspace,
  member: m,
  currentUserId,
  isAdmin,
  isManager,
}: {
  workspace: string;
  member: MemberDirectoryEntry;
  currentUserId: string;
  isAdmin: boolean;
  isManager: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const isSelf = m.userId === currentUserId;
  const isArchived = m.archivedAt !== null;
  const isProtected = PROTECTED_ROLES.includes(m.role);
  const canManage =
    isManager &&
    !isSelf &&
    !isArchived &&
    m.role !== "school_admin" &&
    (isAdmin || !isProtected);
  const canImpersonate =
    isAdmin &&
    !isSelf &&
    m.role !== "school_admin" &&
    m.isActive &&
    !isArchived;
  const canResetPassword =
    isManager &&
    !isSelf &&
    !isArchived &&
    m.role !== "school_admin" &&
    (isAdmin || !isProtected);
  const canArchive =
    isAdmin && !isSelf && !isArchived && m.role !== "school_admin";
  const canChangeRole =
    isAdmin && !isSelf && !isArchived && m.role !== "school_admin";
  const showStatusSwitch = canManage || (isArchived && !isSelf && isManager);

  return (
    <tr
      className={cn(
        "items-center",
        isArchived && "bg-muted/50 text-muted-foreground",
      )}
    >
      <td className="px-4 py-3 font-medium">{m.fullName}</td>
      <td
        className={cn(
          "px-4 py-3",
          isArchived ? "text-muted-foreground/80" : "text-muted-foreground",
        )}
      >
        {m.email ?? "—"}
      </td>
      <td className="px-4 py-3 capitalize">
        {canChangeRole ? (
          <>
            <Select
              value={m.role}
              disabled={pending}
              onValueChange={(role) => {
                if (!role || role === m.role) return;
                setPendingRole(role);
              }}
            >
              <SelectTrigger size="sm" aria-label={`Role for ${m.fullName}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {grantableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ConfirmDialog
              open={pendingRole !== null}
              onOpenChange={(open) => {
                if (!open) setPendingRole(null);
              }}
              title={`Change ${m.fullName}'s role?`}
              description={
                <>
                  <span>
                    {m.fullName} will go from {roleLabel(m.role)} to{" "}
                    {roleLabel(pendingRole ?? "")}.
                  </span>
                  <span>
                    {ROLE_SUMMARIES[pendingRole ?? ""] ??
                      "Access updates the next time they use the workspace."}
                  </span>
                </>
              }
              confirmLabel="Change role"
              confirmVariant="default"
              pending={pending}
              onConfirm={() => {
                if (!pendingRole) return;
                const nextRole = pendingRole;
                setPendingRole(null);
                startTransition(async () => {
                  const result = await changeMemberRoleAction(
                    workspace,
                    m.userId,
                    nextRole,
                  );
                  notifyAction(
                    result,
                    `${m.fullName} is now ${roleLabel(nextRole)}`,
                  );
                });
              }}
            />
          </>
        ) : (
          roleLabel(m.role)
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className={
              !isArchived && m.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-muted-foreground"
            }
          >
            {!isArchived && m.isActive ? "Active" : "Inactive"}
          </Badge>
          {isArchived ? <Badge variant="outline">Archived</Badge> : null}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {showStatusSwitch ? (
            <Switch
              size="sm"
              checked={isArchived ? false : m.isActive}
              disabled={pending || isArchived}
              aria-label={
                isArchived
                  ? `${m.fullName} is archived and inactive`
                  : m.isActive
                    ? `Deactivate ${m.fullName}`
                    : `Activate ${m.fullName}`
              }
              onCheckedChange={(checked) => {
                if (isArchived) return;
                startTransition(async () => {
                  const result = await toggleMemberActiveAction(
                    workspace,
                    m.userId,
                    checked ? "activate" : "deactivate",
                  );
                  notifyAction(
                    result,
                    checked
                      ? `${m.fullName} can sign in again`
                      : `${m.fullName} paused`,
                  );
                });
              }}
            />
          ) : null}
          {canResetPassword ? (
            <ResetPasswordDialog
              workspace={workspace}
              targetUserId={m.userId}
              memberName={m.fullName}
            />
          ) : null}
          {canImpersonate ? (
            <form action={startImpersonationAction.bind(null, workspace)}>
              <input type="hidden" name="targetUserId" value={m.userId} />
              <Button type="submit" variant="outline" size="xs" disabled={pending}>
                Login as
              </Button>
            </form>
          ) : null}
          {canArchive ? (
            <ConfirmDialog
              title={`Archive ${m.fullName}?`}
              description={
                <>
                  <span>
                    This permanently removes access. {m.fullName} stays in the
                    directory for history.
                  </span>
                  <span>
                    You cannot restore them with Activate. Use Inactive if they
                    may return.
                  </span>
                </>
              }
              confirmLabel="Archive"
              pending={pending}
              trigger={
                <Button variant="ghost" size="xs" disabled={pending}>
                  Archive
                </Button>
              }
              onConfirm={() => {
                startTransition(async () => {
                  const result = await archiveMemberAction(workspace, m.userId);
                  notifyAction(result, `${m.fullName} archived`);
                });
              }}
            />
          ) : null}
          {!showStatusSwitch &&
          !canResetPassword &&
          !canImpersonate &&
          !canArchive ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function ResetPasswordDialog({
  workspace,
  targetUserId,
  memberName,
}: {
  workspace: string;
  targetUserId: string;
  memberName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          Reset password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {memberName}. Tell them the new password in
            person. They cannot reset it themselves.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ResetMemberPasswordForm
            workspace={workspace}
            targetUserId={targetUserId}
            memberName={memberName}
            onSuccess={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
