import { NextResponse } from "next/server";

/**
 * Centralized HTTP error + response handling for route handlers.
 *
 * This is the App Router analog of an Express error-middleware file: every
 * route handler can throw an `HttpError` (or any error) and let
 * `errorResponse` normalize it into a consistent JSON envelope + status code.
 * Route handlers opt in via `withRouteHandler` or by calling `errorResponse`
 * directly inside a try/catch.
 */

export type HttpErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "INTERNAL"
  | "SERVICE_UNAVAILABLE";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly code: HttpErrorCode = "INTERNAL",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type ErrorEnvelope = {
  ok: false;
  error: {
    status: number;
    code: HttpErrorCode;
    message: string;
    details?: unknown;
  };
};

export type SuccessEnvelope<T> = {
  ok: true;
  data: T;
};

/**
 * True when the thrown value is a Next.js internal redirect/notFound sentinel.
 * These must propagate untouched (they drive router navigation, not JSON).
 */
function isNextNavigationError(error: unknown): boolean {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : "";
  return digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND");
}

/**
 * Normalize any thrown value into a Response with a consistent error envelope.
 * Next.js redirect/notFound sentinels are re-thrown untouched.
 */
export function errorResponse(error: unknown): Response {
  if (isNextNavigationError(error)) {
    throw error;
  }

  if (error instanceof HttpError) {
    const body: ErrorEnvelope = {
      ok: false,
      error: {
        status: error.status,
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    };
    return NextResponse.json(body, { status: error.status });
  }

  // Unknown error: log full details server-side, never leak them to the client.
  console.error("[http] Unhandled route error:", error);

  const status = 500;
  const body: ErrorEnvelope = {
    ok: false,
    error: {
      status,
      code: "INTERNAL",
      message: "Something went wrong.",
    },
  };

  return NextResponse.json(body, { status });
}

/**
 * Wrap a route handler so a thrown value (HttpError or otherwise) becomes a
 * normalized JSON response. Successful handlers return a Response directly.
 */
export function withRouteHandler<Context>(
  handler: (req: Request, context: Context) => Response | Promise<Response>,
): (req: Request, context: Context) => Promise<Response> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Build a success envelope (for handlers that return data rather than a Response). */
export function ok<T>(data: T): NextResponse<SuccessEnvelope<T>> {
  return NextResponse.json({ ok: true, data });
}
