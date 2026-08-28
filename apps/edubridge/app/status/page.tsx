import { notFound } from "next/navigation";
import { StatusDashboard } from "@/features/shell";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <StatusDashboard />;
}
