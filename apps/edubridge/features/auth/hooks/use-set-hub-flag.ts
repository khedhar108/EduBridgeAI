"use client";

import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import {
  setHubFlagAction,
  type SetHubFlagState,
} from "../actions/set-hub-flag";

type Vars = {
  capability: string;
  role: string;
  enabled: boolean;
};

export function useSetHubFlag(
  workspace: string,
  schoolId?: string,
  userId?: string,
) {
  const router = useRouter();

  return useActionMutation<SetHubFlagState, Vars>(
    queryKeys.auth.setHubFlag(),
    ({ capability, role, enabled }) =>
      setHubFlagAction(workspace, capability, role, enabled),
    {
      schoolId,
      userId,
      onOk: () => {
        router.refresh();
      },
    },
  );
}
