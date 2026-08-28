"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: "ok" | "down";
      latencyMs: number;
      error?: string;
    };
  };
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; httpStatus: number }
  | { kind: "ok"; httpStatus: number; health: HealthResponse };

/**
 * Dev-only diagnostics dashboard. Fetches `/api/health` to demonstrate the
 * "front end → back end" and "back end → database" reachability chain.
 */
export function StatusDashboard() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const check = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const httpStatus = response.status;
      if (!response.ok) {
        setState({ kind: "error", httpStatus });
        return;
      }
      const health = (await response.json()) as HealthResponse;
      setState({ kind: "ok", httpStatus, health });
    } catch {
      setState({ kind: "error", httpStatus: 0 });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const dbStatus = state.kind === "ok" ? state.health.checks.database.status : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Development only
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Status</h1>
          <p className="text-sm text-muted-foreground">
            Front end → back end → database reachability.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={check} className="h-11">
          Re-check
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="API round trip"
          value={state.kind === "ok" ? "Reachable" : state.kind === "error" ? "Failed" : "…"}
        />
        <Stat
          label="HTTP status"
          value={
            state.kind === "loading"
              ? "…"
              : state.httpStatus === 0
                ? "network error"
                : String(state.httpStatus)
          }
        />
        <Stat label="Database" value={dbStatus ?? "…"} />
      </section>

      {state.kind === "ok" ? (
        <section className="flex flex-col gap-3 rounded-md border border-border p-4">
          <p className="text-sm font-medium">Health payload</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="text-right">{state.health.status}</dd>
            <dt className="text-muted-foreground">DB latency</dt>
            <dd className="text-right">{state.health.checks.database.latencyMs} ms</dd>
            <dt className="text-muted-foreground">Uptime</dt>
            <dd className="text-right">{state.health.uptime} s</dd>
          </dl>
        </section>
      ) : null}

      {state.kind === "error" ? (
        <p className="text-sm text-destructive">
          Could not reach <code>/api/health</code>
          {state.httpStatus ? ` (HTTP ${state.httpStatus})` : ""}. Check that the
          backend is running and <code>DATABASE_URL</code> is configured.
        </p>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
