import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Auth Admin client. Server-only. Never import from client
 * components. Required for office-created staff accounts and password reset.
 */

export class AdminAuthUnavailableError extends Error {
  constructor() {
    super("SUPABASE_SERVICE_ROLE_KEY is not set.");
    this.name = "AdminAuthUnavailableError";
  }
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new AdminAuthUnavailableError();
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createConfirmedAuthUser(
  email: string,
  password: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new AdminAuthError(error?.message ?? "CREATE_USER_FAILED");
  }
  return data.user.id;
}

export async function updateAuthUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
  });
  if (error) {
    throw new AdminAuthError(error.message);
  }
}
