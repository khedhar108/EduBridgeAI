import type { QueryClient } from "@tanstack/react-query";

function keyLabel(key: readonly unknown[] | undefined): string {
  if (!key || key.length === 0) return "(no-key)";
  return JSON.stringify(key);
}

function pagePath(): string {
  if (typeof window === "undefined") return "(ssr)";
  return window.location.pathname;
}

/**
 * One-line TanStack Query traces. Browser DevTools only (TQ runs on the client).
 * The matching server half is Next's `└ f <actionName>` in the terminal.
 */
export function attachQueryDebug(client: QueryClient): void {
  if (process.env.NODE_ENV === "production") return;
  if (typeof window === "undefined") return;

  client.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") return;
    if (event.action.type !== "fetch") return;
    console.info(`[tq] query ${keyLabel(event.query.queryKey)} @ ${pagePath()}`);
  });

  client.getMutationCache().subscribe((event) => {
    if (event.type !== "updated") return;
    if (event.action.type !== "pending") return;
    console.info(
      `[tq] mutate ${keyLabel(event.mutation.options.mutationKey)} @ ${pagePath()}`,
    );
  });
}
