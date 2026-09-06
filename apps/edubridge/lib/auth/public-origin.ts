import { headers } from "next/headers";
import { getAppEnvironment } from "@/lib/deployment-environment";

/** Public site origin for Supabase email redirect URLs. */
export async function getPublicOrigin(): Promise<string> {
  const appEnvironment = getAppEnvironment();
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;

  if (explicit) {
    const url = new URL(explicit);
    const hasUnexpectedParts =
      url.pathname !== "/" || Boolean(url.search) || Boolean(url.hash);

    if (
      hasUnexpectedParts ||
      (appEnvironment !== "local" && url.protocol !== "https:")
    ) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be an HTTPS origin without a path, query, or hash.",
      );
    }

    return url.origin;
  }

  if (appEnvironment !== "local") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set for staging and production.",
    );
  }

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  return `http://${host}`;
}
