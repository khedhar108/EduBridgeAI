# ADR-011: TanStack Query as the client server-state cache

**Status:** Proposed  
**Date:** 2026-08-27

## Context

EduBridge's data layer (ADR-004) uses **Drizzle ORM** inside `withTenant(...)` transactions for every table read/write, with **RLS policies** in Postgres as the isolation backstop. Server Components load data synchronously via `getSessionContext` → `assertCapability` → `withTenant` → feature `queries/*`. Client forms call those same actions through TanStack Query (`useActionMutation` in `lib/query/`), and mutations still `revalidatePath` to refresh the Next.js router cache.

That server-first model is secure, type-safe, and gives us SSR for free. What it lacks is a **client-side cache** for:

1. Avoiding redundant network round-trips when the same data is rendered by multiple client islands.
2. Refetching after a mutation without a full page reload.
3. Coordinating loading, error, retry, stale-while-revalidate, and optimistic-update states declaratively.
4. Sharing server state across client components without prop drilling or duplicating fetch logic.

Several options exist for a client cache:

- **No library — keep hand-rolled `useEffect` + debounce + local state.** Already used for the username availability check. Works for one-off features, but each new feature repeats the same deduplication, cancellation, and invalidation logic.
- **SWR** — lightweight, but less powerful mutation/invalidation graph and no built-in mutation state orchestration.
- **Zustand / Redux / Jotai for server state** — possible, but these are state managers, not server-state libraries. They don't dedupe, retry, or refocus automatically.
- **TanStack Query (`@tanstack/react-query`)** — de-facto server-state library; gives us keyed caching, declarative loading/error states, automatic deduplication, mutation invalidation, and SSR hydration patterns. It is the right tool for client server-state.

This ADR does **not** change ADR-004 (Drizzle/RLS stays the source of truth). It adds a client cache layer on top, using server actions as transport.

## Decision

Adopt **`@tanstack/react-query`** (pinned to an exact version in the pnpm catalog) as the **only client server-state layer** in `apps/edubridge`.

Use a **hybrid architecture**:

- **RSC / Drizzle / Postgres** remain the source of truth for first paint, auth gates, role checks, and all table access.
- **TanStack Query** handles client-driven server state: refetching, shared cache, mutation orchestration, optimistic updates, debounced lookups, polling, and pagination.
- **Transport** from the browser to the DB is still **server actions** (`"use server"`) that resolve the session, assert capabilities, and run `withTenant` → Drizzle. No REST CRUD API is introduced. No Supabase JS client table access from the browser.
- **Placement:** keep the TanStack Query infrastructure inside `apps/edubridge/lib/query/`. Do **not** create a shared `packages/query` or `@repo/query` package until a second application genuinely needs the same cache primitives. The QueryClient factory and generic error types are reusable in principle, but the query key factory, provider wiring, and feature hooks encode EduBridge product semantics and belong with the product app. Follow the repo rule: promote to shared packages only at 2+ consumers.

### RSC / Drizzle / DB / Frontend connection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────────┐  │
│  │ RSC page              │  │ Client island                             │  │
│  │ (async Server         │  │  - useQuery(...)                           │  │
│  │  Component)           │  │  - useMutation(...)                        │  │
│  │                       │  │                                            │  │
│  │  getSessionContext()  │  │  queryFn: server action("use server")     │  │
│  │       ↓               │  │       ↓                                    │  │
│  │  withTenant(claims,   │  │  getSessionContext()                       │  │
│  │  async (tx) => {      │  │       ↓                                    │  │
│  │    await queries/*     │  │  assertCapability(...)                     │  │
│  │  })                   │  │       ↓                                    │  │
│  │       ↓               │  │  withTenant(claims, async (tx) => {         │  │
│  │  serializable props   │  │    await queries/*                          │  │
│  │       ↓               │  │  })                                        │  │
│  │  props to client     │  │       ↓                                    │  │
│  │  components          │  │  return data / throw                       │  │
│  └───────────────────────┘  └───────────────────────────────────────────┘  │
│              │                                  │                           │
│              │                                  │                           │
│              └──────── TanStack Query cache ───┘                           │
│                                                  (shared, keyed,          │
│                                                   invalidated on writes)    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Server boundary (cookies, RLS)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Next.js server action                                                      │
│    getSessionContext(workspace) → session (userId, schoolId, role)         │
│    assertCapability(ctx, "students.view")                                   │
│    withTenant({ sub, school_id, role }, async (tx) => {                    │
│      // Drizzle query inside RLS transaction                                │
│    })                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Postgres (Supabase)                                                        │
│    SET LOCAL ROLE authenticated;                                            │
│    RLS policies filter by school_id from session claims                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What belongs where

| Concern | Owner | Files |
|---------|-------|-------|
| Schema / migrations | `packages/db` | `src/schema/*.ts`, `src/migrations/*.sql` |
| Drizzle transaction wrapper | `packages/db` | `src/rls.ts` → `withTenant` |
| Server-only feature queries | `features/<module>/queries/` | e.g. `student-dashboard/queries/list-classes.ts` |
| Server actions (mutations + read FNs) | `features/<module>/actions/` | e.g. `student-dashboard/actions/record-attendance.ts` |
| Client hooks wrapping TQ | `features/<module>/hooks/` | e.g. `student-dashboard/hooks/use-class-roster.ts` |
| Shared TQ infrastructure | `apps/edubridge/lib/query/` | `client.ts`, `provider.tsx`, `keys.ts`, `types.ts`, `errors.ts` |
| UI components | `features/<module>/components/` | receive props or use hooks |

### Query keys and tenancy

Client cache must be tenant-scoped. Query keys are built from a central factory and include the effective identity.

```ts
// lib/query/keys.ts
export const queryKeys = {
  root: ["edubridge"] as const,

  // Authenticated workspace data: always scope by school + user.
  school: (schoolId: string) =>
    [...queryKeys.root, "school", schoolId] as const,
  user: (schoolId: string, userId: string) =>
    [...queryKeys.school(schoolId), "user", userId] as const,

  students: {
    roster: (
      schoolId: string,
      userId: string,
      classId: string,
      date: string,
    ) =>
      [...queryKeys.user(schoolId, userId), "students", "roster", classId, date] as const,
  },

  // Pre-auth surfaces have no session, so we scope by school slug.
  auth: {
    usernameCheck: (schoolSlug: string, username: string) =>
      [...queryKeys.root, "auth", "username-check", schoolSlug, username] as const,
  },
};
```

### Result type for server-action transport

New TQ-facing server actions return a common result type so the cache can throw on errors and the UI can map codes.

```ts
// lib/query/types.ts
export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export type ActionError = {
  code: ActionErrorCode;
  message: string;
  fields?: Record<string, string>;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };
```

```ts
// lib/query/errors.ts
import type { ActionResult } from "./types";

export class ActionClientError extends Error {
  readonly code: ActionErrorCode;
  constructor(error: ActionError) {
    super(error.message);
    this.name = "ActionClientError";
    this.code = error.code;
  }
}

export function unwrapAction<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ActionClientError(result.error);
  return result.data;
}
```

### QueryClient defaults

```ts
// lib/query/client.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
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
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
```

### Provider wiring

```ts
// lib/query/provider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

Mount the provider once, near the root:

```ts
// app/providers.tsx
"use client";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { QueryProvider } from "@/lib/query/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <QueryProvider>{children}</QueryProvider>
    </TooltipProvider>
  );
}
```

### Example: read action + TQ hook for class roster

Server action transport:

```ts
// features/student-dashboard/actions/get-class-roster.ts
"use server";

import { withTenant } from "@repo/db";
import { can } from "@/lib/auth/capabilities";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { ActionResult } from "@/lib/query/types";
import {
  listAccessibleClasses,
  listClassRoster,
} from "../queries/list-classes";
import { listAttendanceForDate } from "../queries/attendance";
import { listClassWideActivities } from "../queries/activities";

export type ClassRosterData = {
  accessible: Awaited<ReturnType<typeof listAccessibleClasses>>;
  roster: Awaited<ReturnType<typeof listClassRoster>>;
  existing: Awaited<ReturnType<typeof listAttendanceForDate>>;
  events: Awaited<ReturnType<typeof listClassWideActivities>>;
};

export async function getClassRosterAction(
  workspace: string,
  classId: string,
  date: string,
): Promise<ActionResult<ClassRosterData>> {
  const ctx = await getSessionContext(workspace);
  if (!ctx || !can(ctx, "students.view")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Not allowed." } };
  }

  const data = await withTenant(
    { sub: ctx.userId, school_id: ctx.schoolId, role: ctx.role },
    async (tx) => {
      const [roster, existing, events] = await Promise.all([
        listClassRoster(tx, ctx.schoolId, classId),
        listAttendanceForDate(tx, ctx.schoolId, classId, date),
        listClassWideActivities(tx, ctx.schoolId, classId),
      ]);
      const accessible = await listAccessibleClasses(tx, ctx.schoolId);
      return { accessible, roster, existing, events };
    },
  );

  return { ok: true, data };
}
```

Client hook:

```ts
// features/student-dashboard/hooks/use-class-roster.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { unwrapAction } from "@/lib/query/errors";
import { getClassRosterAction } from "../actions/get-class-roster";

export function useClassRoster(
  workspace: string,
  schoolId: string,
  userId: string,
  classId: string,
  date: string,
) {
  return useQuery({
    queryKey: queryKeys.students.roster(schoolId, userId, classId, date),
    queryFn: async () => unwrapAction(await getClassRosterAction(workspace, classId, date)),
    staleTime: 30_000,
  });
}
```

### Example: mutation + invalidation

```ts
// features/student-dashboard/hooks/use-record-attendance.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { recordAttendanceAction } from "../actions/record-attendance";

export function useRecordAttendance(
  workspace: string,
  schoolId: string,
  userId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => recordAttendanceAction(workspace, {}, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user(schoolId, userId),
      });
      // Keep Next.js cache invalidation too.
      // revalidatePath is still called inside the server action.
    },
  });
}
```

### Example: SSR prefetch (optional, for heavy dashboards)

```tsx
// app/[workspace]/(staff)/students/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getClassRosterAction } from "@/features/student-dashboard/actions/get-class-roster";

export default async function StudentsPage({ params, searchParams }) {
  const { workspace } = await params;
  const { class: classId, date } = await searchParams;

  const queryClient = new QueryClient();
  // Pre-fetch on the server, seed the client cache.
  await queryClient.prefetchQuery({
    queryKey: queryKeys.students.roster(schoolId, userId, classId, date),
    queryFn: () => getClassRosterAction(workspace, classId, date).then(r => r.data),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchoolStudentsPage workspace={workspace} classId={classId} date={date} />
    </HydrationBoundary>
  );
}
```

> Note: SSR hydration is not required for the first phase. We can start with client-only TQ on interactive islands and add `HydrationBoundary` later for heavy pages.

## Consequences

### Why TanStack Query, not just Next.js defaults?

Next.js App Router already provides request-time rendering, streaming, and `revalidatePath`. Those stay. TanStack Query is added for capabilities that are either absent from Next.js or require significant hand-rolling:

| Capability | Next.js default | TanStack Query |
|---|---|---|
| Client cache keyed by request | No (only `fetch` cache on server, `revalidatePath` invalidates whole route) | Yes — granular, keyed cache per entity |
| Shared cache across client components | Manual via props / context | Automatic via `queryKey` |
| Stale-while-revalidate | Not on the client | Built-in (`staleTime`, background refetch) |
| Automatic retry with backoff | Manual | Built-in (`retry`, `retryDelay`) |
| Query cancellation on unmount / new key | Manual `AbortController` | Automatic via `AbortSignal` |
| Refetch on window focus / reconnect | Not provided | Built-in |
| Polling / live data | Manual `setInterval` | `refetchInterval` |
| Dedupe concurrent identical requests | Manual | Built-in |
| Optimistic updates | Manual state juggling | `onMutate` + rollback |
| Mutation lifecycle + cross-component state | Manual | `useMutation`, `useMutationState` |
| Prefetch on hover / intent | Manual | `queryClient.prefetchQuery` |
| Infinite / paginated queries | Manual | `useInfiniteQuery` |
| SSR hydration of client cache | Possible with `dehydrate`/`HydrationBoundary` — but manual wiring | Same wiring, but the cache becomes shared between server and client |
| DevTools for cache inspection | None | TanStack Query DevTools |

### Async state handling

Server actions are async. In default Next.js, every client component that calls a server action must manually coordinate `pending`, `error`, and `data` states:

```tsx
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  setIsLoading(true);
  getDataAction().then(setData).catch(setError).finally(() => setIsLoading(false));
}, []);
```

TanStack Query replaces this with a single declarative hook:

```tsx
const { data, error, isLoading, isFetching, status } = useQuery({
  queryKey: queryKeys.students.roster(...),
  queryFn: () => getClassRosterAction(...).then(unwrapAction),
});
```

This eliminates race conditions when the same data is requested from multiple components, automatically cancels abandoned requests, and unifies loading/error/fetching states.

### Pros

- **Deduped, cached, background-refetched data** across client components.
- **Declarative loading, error, and fetching states** instead of hand-rolled booleans.
- **Mutation invalidation graph** makes UI stay in sync after writes without a full page reload.
- **Retry, focus refetch, polling, and optimistic updates** come out of the box.
- **No change to the security model**: RLS, `withTenant`, and capability checks remain server-side; TQ never talks to the DB directly.
- **Server actions stay the only transport**, keeping the architecture consistent with ADR-004.

### Cons

- **Another cache to reason about** alongside Next.js RSC cache and router cache.
- **Bundle size** increase (small, but non-zero).
- **Server actions as `queryFn`** lose HTTP-level caching that REST endpoints could provide; acceptable because we deliberately avoid a public REST CRUD surface.
- **Hydration complexity** if we prefetch server data into the TQ cache; must keep keys stable and server/client identical.
- **Adoption is cross-cutting**: every feature needs a read action, a hook, and correct invalidation keys.
- **Placement constraint:** the infra must remain in `apps/edubridge/lib/query/` until a second app needs it. Creating a shared package now would add coupling without a real consumer.

### Placement rule

- **Phase 1 (now):** all TanStack Query code lives in `apps/edubridge/lib/query/` and `features/<module>/hooks/`.
- **Phase 2 (future, only if needed):** if `apps/web` or another app needs the same generic `makeQueryClient` / `ActionResult` primitives, extract only those parts into a package. The query key factory and feature hooks never move, because they are product-specific.

## Migration approach

Adopt feature-by-feature, not all at once. Start with the highest-value/lowest-risk surfaces:

1. **Username availability check** — debounced lookup, no SSR complexity.
2. **Record attendance** — mutation + invalidation so the page does not reload after saving.
3. **Staff directory toggles/impersonation** — shared client state and quick invalidation.
4. **Fees collections / student registration** — filters and lists that stay fresh.
5. **Family hub child switcher** — cache per active child for faster switching.

A feature is considered migrated only when it has been manually verified. Track progress in `docs/guides/tanstack-query-adoption.md`.

## Non-goals

- **Not replacing RSC reads** for static/first-paint pages.
- **Not adding a REST CRUD API**.
- **Not using TanStack Router / Form / Table** at this stage.
- **Not promoting to a shared package** (`@repo/query`) until a second app needs the same cache infra.

## Security invariants

1. TQ is a **UX cache only**; it never participates in authorization.
2. Every server action still resolves the session and asserts capabilities.
3. Every DB query still runs inside `withTenant` with RLS active.
4. Client-provided identifiers (`schoolId`, `userId`, `classId`) are used only for **cache keys** or as routing arguments; the server re-resolves the real tenant/role from the session.

## References

- [ADR-004: Drizzle ORM over Supabase Postgres](./ADR-004-drizzle-data-access.md)
- [docs/architecture/data-access.md](../architecture/data-access.md)
- [docs/guides/tanstack-query-adoption.md](../guides/tanstack-query-adoption.md) (how routing hits the DB, config/error files, remaining work)
- `.cursor/rules/15-client-data.mdc`
- TanStack Query docs: https://tanstack.com/query/latest
