"use client";

import { Toaster } from "@repo/ui/components/sonner";
import { TooltipProvider } from "@repo/ui/components/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
