import { checkDatabaseHealth } from "@/lib/health";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HealthCheckStatus = "ok" | "degraded";

type HealthResponse = {
  status: HealthCheckStatus;
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

export async function GET() {
  try {
    const database = await checkDatabaseHealth();
    const status: HealthCheckStatus = database.ok ? "ok" : "degraded";

    const body: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      checks: {
        database: {
          status: database.ok ? "ok" : "down",
          latencyMs: database.latencyMs,
          ...(database.error ? { error: database.error } : {}),
        },
      },
    };

    return Response.json(body, {
      status: database.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
