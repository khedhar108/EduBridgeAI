"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/features/shell/components/error-screen";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] Runtime error:", error);
  }, [error]);

  return <ErrorScreen statusCode={500} onReset={reset} />;
}
