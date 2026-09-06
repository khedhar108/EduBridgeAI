import type { HttpErrorCode } from "@/lib/http";
import type { ActionError, ActionResult } from "./types";

/**
 * Next.js `redirect()` / `notFound()` throw sentinels. They must leave
 * `mutationFn` so the router can navigate. Catching them as a TQ error
 * swallows the redirect.
 */
export function isNextNavigationError(error: unknown): boolean {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : "";
  return digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND");
}

export class ActionClientError extends Error {
  readonly code: HttpErrorCode;
  readonly fields?: Record<string, string>;

  constructor(error: ActionError) {
    super(error.message);
    this.name = "ActionClientError";
    this.code = error.code;
    this.fields = error.fields;
  }
}

export function unwrapAction<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ActionClientError(result.error);
  return result.data;
}
