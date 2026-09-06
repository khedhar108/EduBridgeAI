"use client";

import { Toaster } from "@repo/ui/components/sonner";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { QueryProvider } from "@/lib/query/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <QueryProvider>{children}</QueryProvider>
      <Toaster />
    </TooltipProvider>
  );
}
