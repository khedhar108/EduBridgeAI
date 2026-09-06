import type { HttpErrorCode } from "@/lib/http";

export type ActionError = {
  code: HttpErrorCode;
  message: string;
  fields?: Record<string, string>;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };
