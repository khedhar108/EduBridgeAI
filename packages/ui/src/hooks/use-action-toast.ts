"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export type ActionFeedback = {
  error?: string;
  ok?: boolean;
};

export function notifyAction(result: ActionFeedback, success?: string) {
  if (result.error) {
    toast.error(result.error);
    return;
  }
  if (result.ok && success) {
    toast.success(success);
  }
}

export function useActionToast(
  state: ActionFeedback,
  successMessage?: string,
) {
  const prev = useRef(state);

  useEffect(() => {
    if (Object.is(state, prev.current)) return;
    prev.current = state;
    notifyAction(state, successMessage);
  }, [state, successMessage]);
}
