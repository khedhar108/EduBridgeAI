import { PLATFORM_DOMAIN } from "./brand";

export const APP_ENVIRONMENTS = ["local", "staging", "production"] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

const APP_ENVIRONMENT_SET = new Set<string>(APP_ENVIRONMENTS);
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function isAppEnvironment(value: string): value is AppEnvironment {
  return APP_ENVIRONMENT_SET.has(value);
}

function normalizeRootDomain(value: string): string {
  const domain = value.trim().toLowerCase().replace(/\.$/, "");
  const labels = domain.split(".");

  if (
    !domain ||
    domain.includes("://") ||
    domain.includes("/") ||
    domain.includes(":") ||
    domain.includes("*") ||
    labels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))
  ) {
    throw new Error(
      "WORKSPACE_ROOT_DOMAIN must be a hostname such as dev.edubridge.app.",
    );
  }

  return domain;
}

/**
 * Deployment hostname identity (`APP_ENV`, `WORKSPACE_ROOT_DOMAIN`).
 * Security/product gates (email, secrets, demo UI) use NODE_ENV:
 * development = local pnpm dev; production = Vercel staging and Coolify main.
 */
export function getAppEnvironment(): AppEnvironment {
  const rawConfigured = process.env.APP_ENV?.trim().toLowerCase();
  const configured: AppEnvironment | undefined =
    rawConfigured && isAppEnvironment(rawConfigured) ? rawConfigured : undefined;

  if (rawConfigured && !configured) {
    throw new Error(
      `APP_ENV must be one of: ${APP_ENVIRONMENTS.join(", ")}.`,
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (configured && configured !== "local") {
      throw new Error(
        "APP_ENV must be local when NODE_ENV is development. Use a production build to test staging.",
      );
    }
    return "local";
  }

  if (!configured || configured === "local") {
    throw new Error(
      "APP_ENV must be staging or production outside local development.",
    );
  }

  return configured;
}

export function isStagingDeployment(): boolean {
  return getAppEnvironment() === "staging";
}

export function shouldTrustForwardedHost(): boolean {
  return getAppEnvironment() !== "local";
}

export function getWorkspaceRootDomain(): string {
  const configured = process.env.WORKSPACE_ROOT_DOMAIN;

  if (configured) {
    return normalizeRootDomain(configured);
  }

  if (getAppEnvironment() === "local") {
    return PLATFORM_DOMAIN;
  }

  throw new Error(
    "WORKSPACE_ROOT_DOMAIN must be set for staging and production.",
  );
}
