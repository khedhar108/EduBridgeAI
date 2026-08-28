"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { InfoHint } from "@repo/ui/components/info-hint";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  activateMembershipRequestAction,
  rejectMembershipRequestAction,
  type ActivateMemberState,
} from "../actions/activate-member";

const initial: ActivateMemberState = {};

type RequestRow = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

type Props = {
  workspace: string;
  requests: RequestRow[];
};

export function PendingMembersPanel({ workspace, requests }: Props) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending domain-join requests.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {requests.map((req) => (
        <PendingRow key={req.id} workspace={workspace} request={req} />
      ))}
    </ul>
  );
}

function PendingRow({
  workspace,
  request,
}: {
  workspace: string;
  request: RequestRow;
}) {
  const activate = activateMembershipRequestAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(activate, initial);
  const rejectBound = rejectMembershipRequestAction.bind(null, workspace);
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectBound,
    initial,
  );
  useActionToast(state, "Member activated.");
  useActionToast(rejectState, "Request rejected.");

  return (
    <li className="flex flex-col gap-3 border-b border-border pb-4">
      <div>
        <p className="text-sm font-medium">{request.fullName}</p>
        <p className="text-sm text-muted-foreground">{request.email}</p>
        <p className="text-xs text-muted-foreground">
          Requested {request.createdAt}
        </p>
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="requestId" value={request.id} />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label htmlFor={`role-${request.id}`} className="text-xs font-medium">
              Role
            </label>
            <InfoHint label="What this role grants" title="Role">
              They join with this role. You cannot grant school admin.
              Coordinator manages people but not fees.
            </InfoHint>
          </div>
          <select
            id={`role-${request.id}`}
            name="role"
            required
            disabled={pending || rejectPending}
            defaultValue="teacher"
            className="border-input bg-background h-11 rounded-md border px-3 text-sm"
          >
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
            <option value="accountant">Accountant</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>
        <Button type="submit" className="h-11" disabled={pending || rejectPending}>
          {pending ? <Spinner className="size-4" /> : null}
          Activate
        </Button>
      </form>

      <form action={rejectAction}>
        <input type="hidden" name="requestId" value={request.id} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="h-11"
          disabled={pending || rejectPending}
        >
          {rejectPending ? <Spinner className="size-4" /> : null}
          Reject
        </Button>
      </form>
    </li>
  );
}
