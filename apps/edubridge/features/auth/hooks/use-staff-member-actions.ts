"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  archiveMemberAction,
  type ArchiveMemberState,
} from "../actions/archive-member";
import {
  changeMemberRoleAction,
  type ChangeMemberRoleState,
} from "../actions/change-member-role";
import {
  toggleMemberActiveAction,
  type ToggleMemberActiveState,
} from "../actions/toggle-member-active";

type ToggleVars = {
  targetUserId: string;
  action: "activate" | "deactivate";
};

type RoleVars = {
  targetUserId: string;
  nextRole: string;
};

export function useStaffMemberActions(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  const changeRole = useActionMutation<ChangeMemberRoleState, RoleVars>(
    queryKeys.auth.changeMemberRole(),
    ({ targetUserId, nextRole }) =>
      changeMemberRoleAction(workspace, targetUserId, nextRole),
    { schoolId, userId },
  );

  const toggleActive = useActionMutation<ToggleMemberActiveState, ToggleVars>(
    queryKeys.auth.toggleMember(),
    ({ targetUserId, action }) =>
      toggleMemberActiveAction(workspace, targetUserId, action),
    { schoolId, userId },
  );

  const archive = useActionMutation<ArchiveMemberState, string>(
    queryKeys.auth.archiveMember(),
    (targetUserId) => archiveMemberAction(workspace, targetUserId),
    { schoolId, userId },
  );

  return { changeRole, toggleActive, archive };
}
