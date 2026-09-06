export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Liveness only — no database. Coolify/Docker probes this. Use /api/health for readiness. */
export function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
