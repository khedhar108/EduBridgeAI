import { LEGAL_DOCS_IN_FORCE, operatorParty } from "@/lib/legal/constants";
import { PLATFORM_NAME } from "@/lib/brand";

export function DraftBanner() {
  if (LEGAL_DOCS_IN_FORCE) return null;

  return (
    <p
      role="status"
      className="rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
    >
      Draft only — not in force. These pages are published so you can read how{" "}
      {PLATFORM_NAME} intends to operate. They do not form a contract and are
      not a DPDP notice until {operatorParty()} is named as a legal person and
      this banner is removed.
    </p>
  );
}
