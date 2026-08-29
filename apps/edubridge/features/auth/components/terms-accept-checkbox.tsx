"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/brand";
import { LEGAL_DOCS_IN_FORCE, TERMS_VERSION } from "@/lib/legal/constants";
import { readConsentFromDocument } from "@/lib/legal/consent";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/legal/paths";

type Props = {
  disabled?: boolean;
};

/**
 * Unchecked by default. If this TERMS_VERSION is already on the consent cookie,
 * hidden fields carry acceptance so remember-me can submit without a pre-tick.
 */
export function TermsAcceptCheckbox({ disabled }: Props) {
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    const stored = readConsentFromDocument();
    setAlreadyAccepted(stored?.termsVersion === TERMS_VERSION);
  }, []);

  if (alreadyAccepted) {
    return (
      <>
        <input type="hidden" name="acceptTerms" value="on" />
        <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
        <p className="text-xs text-muted-foreground">
          You already acknowledged {PLATFORM_NAME} Terms version {TERMS_VERSION}
          .
        </p>
      </>
    );
  }

  const label = LEGAL_DOCS_IN_FORCE
    ? `I have read and agree to the ${PLATFORM_NAME} Terms and Privacy Policy`
    : `I acknowledge the draft Terms and Privacy Policy (not yet in force)`;

  return (
    <div className="flex flex-col gap-1">
      <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="acceptTerms"
          value="on"
          required
          checked={ticked}
          disabled={disabled}
          onChange={(event) => setTicked(event.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-primary"
        />
        <span>
          {label}{" "}
          <Link
            href={TERMS_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          {" · "}
          <Link
            href={PRIVACY_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
        </span>
      </label>
    </div>
  );
}
