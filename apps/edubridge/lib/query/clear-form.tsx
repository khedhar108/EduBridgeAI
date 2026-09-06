"use client";

import type { ReactNode } from "react";
import { clearQueryCache } from "./client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
};

/** Drop-in form: wipe TQ cache before sign-out / impersonation submit. */
export function CacheClearForm({ action, children, className }: Props) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={() => {
        clearQueryCache();
      }}
    >
      {children}
    </form>
  );
}
