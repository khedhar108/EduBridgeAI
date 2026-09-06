import { TERMS_VERSION } from "./constants";
import { persistTermsAcceptance } from "./consent-server";

export const TERMS_REQUIRED_ERROR =
  "Accept the Terms and Privacy Policy to continue.";

export function termsAcceptedFromForm(formData: FormData): boolean {
  return (
    formData.get("acceptTerms") === "on" &&
    String(formData.get("termsVersion") ?? "") === TERMS_VERSION
  );
}

export async function persistAcceptedTerms(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!termsAcceptedFromForm(formData)) {
    return { ok: false, error: TERMS_REQUIRED_ERROR };
  }
  await persistTermsAcceptance(TERMS_VERSION);
  return { ok: true };
}
