import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Signed-cookie impersonation. The admin's Supabase session stays intact;
 * this cookie swaps the *tenant* identity inside `getSessionContext` +
 * `withTenant` claims so RLS sees the target user. The real auth user is
 * still verified on every request — the cookie alone grants nothing.
 */

const COOKIE_NAME = "edubridge.impersonation";
const TTL_MS = 30 * 60 * 1000;

export type ImpersonationPayload = {
  targetUserId: string;
  targetRole: string;
  targetEmail: string | null;
  schoolId: string;
  expiresAt: number;
};

function getSecret(): string {
  const secret = process.env.IMPERSONATION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("IMPERSONATION_SECRET must be set in production.");
  }
  return secret ?? "dev-impersonation-secret-not-for-prod";
}

function sign(payload: ImpersonationPayload): string {
  const data = JSON.stringify(payload);
  const hmac = createHmac("sha256", getSecret()).update(data).digest("hex");
  return `${Buffer.from(data).toString("base64")}.${hmac}`;
}

function verify(token: string): ImpersonationPayload | null {
  const [dataB64, sig] = token.split(".");
  if (!dataB64 || !sig) return null;
  const data = Buffer.from(dataB64, "base64").toString();
  const expectedSig = createHmac("sha256", getSecret())
    .update(data)
    .digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(data) as ImpersonationPayload;
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setImpersonationCookie(
  payload: Omit<ImpersonationPayload, "expiresAt">,
): Promise<void> {
  const fullPayload: ImpersonationPayload = {
    ...payload,
    expiresAt: Date.now() + TTL_MS,
  };
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sign(fullPayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export async function getImpersonation(): Promise<ImpersonationPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export async function clearImpersonationCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
