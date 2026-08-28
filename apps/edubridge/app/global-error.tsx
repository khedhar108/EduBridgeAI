"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/features/shell/components/error-screen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] Runtime error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorScreen statusCode={500} onReset={reset} />
      </body>
    </html>
  );
}
