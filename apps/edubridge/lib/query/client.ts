import { QueryClient } from "@tanstack/react-query";
import { attachQueryDebug } from "./debug";

export function makeQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: { retry: 0 },
    },
  });
  attachQueryDebug(client);
  return client;
}

export function clearQueryCache(): void {
  if (typeof window === "undefined") return;
  getQueryClient().clear();
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
