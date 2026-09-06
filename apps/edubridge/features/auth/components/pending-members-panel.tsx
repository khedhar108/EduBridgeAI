"use client";

import { Button } from "@repo/ui/components/button";
import { InfoHint } from "@repo/ui/components/info-hint";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { QueryIsland } from "@/lib/query/island";
import type { ActivateMemberState } from "../actions/activate-member";
import {
  useActivateMember,
  useRejectMember,
} from "../hooks/use-activate-member";

const initial: ActivateMemberState = {};

type RequestRow = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

type Props = {
  workspace: string;
  schoolId?: string;
  userId?: string;
  requests: RequestRow[];
};

export function PendingMembersPanel(props: Props) {
  if (props.requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending domain-join requests.
      </p>
    );
  }

  return (
    <QueryIsland>
      <ul className="flex flex-col gap-4">
        {props.requests.map((req) => (
          <PendingRow
            key={req.id}
            workspace={props.workspace}
            schoolId={props.schoolId}
            userId={props.userId}
            request={req}
          />
        ))}
      </ul>
    </QueryIsland>
  );
}

function PendingRow({
  workspace,
  schoolId,
  userId,
  request,
}: {
  workspace: string;
  schoolId?: string;
  userId?: string;
  request: RequestRow;
}) {
  const {
    mutate: activate,
    isPending: pending,
    data: activateResult,
  } = useActivateMember(workspace, schoolId, userId);
  const {
    mutate: reject,
    isPending: rejectPending,
    data: rejectResult,
  } = useRejectMember(workspace, schoolId, userId);
  useActionToast(activateResult ?? initial, "Member activated.");
  useActionToast(rejectResult ?? initial, "Request rejected.");

  return (
    <li className="flex flex-col gap-3 border-b border-border pb-4">
      <div>
        <p className="text-sm font-medium">{request.fullName}</p>
        <p className="text-sm text-muted-foreground">{request.email}</p>
        <p className="text-xs text-muted-foreground">
          Requested {request.createdAt}
        </p>
      </div>

      <form
        action={(formData) => {
          activate(formData);
        }}
        className="flex flex-wrap items-end gap-3"
      >
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

      <form
        action={(formData) => {
          reject(formData);
        }}
      >
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
