# The `features/auth/` Module — Implementation Blueprint

> How authentication is implemented as a feature module in `apps/web`, following the [feature-folder blueprint](../../guides/feature-folder-structure.md). This is the Phase 0 build spec for auth screens, actions, and flows.

## Module layout

```
apps/web/features/auth/
├── components/
│   ├── sign-in-form.tsx          # email + password, plus "email me a code" option
│   ├── otp-verify-form.tsx       # 6-digit OTP (email or phone)
│   ├── provision-member-form.tsx # office: name, email, username, password, role
│   ├── reset-member-password-form.tsx
│   ├── passkey-settings.tsx      # register/remove passkeys (post-MVP)
│   ├── family-sign-in-form.tsx   # admission no. + student DOB (family door)
│   ├── add-child-form.tsx        # parent wrapper: extra admission+DOB (Phase 1)
│   └── user-menu.tsx             # profile, role badge, school switcher, sign out
├── actions/
│   ├── sign-in.ts                # password sign-in
│   ├── sign-in-otp.ts            # request email/phone OTP
│   ├── verify-otp.ts             # verify OTP code
│   ├── sign-out.ts
│   ├── provision-member.ts       # office creates auth user + membership
│   ├── reset-member-password.ts  # office sets a new password
│   ├── register-passkey.ts       # post-MVP
│   └── family-sign-in.ts         # admission + DOB → family cookie
├── queries/
│   └── get-membership.ts         # bootstrap: user -> memberships (school switcher)
├── lib/
│   ├── supabase-server.ts        # @supabase/ssr server client (cookies)
│   ├── supabase-client.ts        # @supabase/ssr browser client
│   ├── schemas.ts                # zod: email, phone, OTP, provision payloads
│   └── redirects.ts              # role-aware post-login redirect logic
├── types.ts
├── index.ts                      # public surface
└── README.md                     # per blueprint (15-30 lines)
```

Route files stay thin and live outside the feature:

```
apps/edubridge/app/
├── (auth)/
│   ├── sign-in/page.tsx          # global fallback; optional school slug for username
│   ├── register/page.tsx         # founder school create
│   ├── register/verify/page.tsx  # email OTP
│   ├── forgot-password/page.tsx
│   ├── update-password/page.tsx
│   └── join-school/page.tsx      # staff domain join (existing school)
├── auth/callback/route.ts        # code exchange (magic link / OAuth) — REQUIRED
├── [workspace]/
│   ├── (public)/sign-in/page.tsx # How are you? then staff or family form
│   ├── (public)/family/          # family app ([family-surface.md](./family-surface.md))
│   │   ├── page.tsx              # cookie → /home; else /sign-in?who=family
│   │   └── (app)/                # home, fees, progress, exams, events
│   ├── (staff)/layout.tsx        # getSessionContext + ShellLayout
│   ├── (staff)/page.tsx
│   └── (staff)/settings/team/    # pending domain-join queue
└── platform/sign-in/page.tsx
```

Workspace public doors (`/{slug}/sign-in`, `/{slug}/family`) sit **outside** the staff shell so they do not call `getSessionContext`. `proxy.ts` treats both as auth surfaces (no Supabase user required). Family cookie does not satisfy staff routes.

## Core patterns (from the nextjs-supabase-auth skill)

```typescript
// lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)),
      },
    }
  );
}
```

```typescript
// actions/sign-in.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) return { error: error.message };   // generic message — no account enumeration

  revalidatePath("/", "layout");
  redirect(await resolvePostLoginDestination()); // role-aware, below
}
```

```typescript
// app/auth/callback/route.ts — required for magic links / OAuth code exchange
import { createClient } from "@/features/auth/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${searchParams.get("next") ?? "/"}`);
  }
  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
```

## Role-aware post-login redirect

After any successful sign-in, `resolvePostLoginDestination()` (in `lib/redirects.ts`):

1. Load the user's memberships (`queries/get-membership.ts`).
2. One membership → redirect straight to that workspace home (`/<slug>`).
3. Multiple → redirect to a workspace chooser (or last-used workspace from a cookie).
4. `platform_owner` claim present → offer console link (console itself re-verifies server-side).
5. Zero memberships → "awaiting invitation" screen (a user without membership sees nothing tenant-related).

## Proxy integration

`apps/edubridge/proxy.ts` (Next 16; not deprecated `middleware.ts`) handles two
jobs in one pass:

1. **Session refresh** — `@supabase/ssr` cookie rotation on every request
   (`getUser()`, never `getSession()`).
2. **Route protection** — unauthenticated staff requests to `/{slug}` or
   `/{slug}/…` redirect to **`/{slug}/sign-in?next=<path>`**, not global
   `/sign-in`. `/{slug}/sign-in` and `/{slug}/family` (and nested family
   paths) are auth surfaces: no Supabase user required. A family cookie
   does not satisfy the staff branch.

Tenant membership checks stay in `getSessionContext()` per request (proxy only
knows the session, not the slug→school resolution). Global `/sign-in` remains
the email + optional-slug fallback.

## Staff create flow (role granting — detail)

```mermaid
sequenceDiagram
    participant A as school_admin_or_coordinator
    participant S as Server action
    participant Auth as Supabase Auth Admin
    participant DB as Postgres
    A->>S: provision-member(name, email, username, password, role)
    S->>S: assertCapability(members.provision, role)
    S->>Auth: createUser email_confirm true
    S->>DB: insert profiles + school_members + audit
    Note over S,DB: role validated against provisionRoles, never school_admin
    S-->>A: account live; office tells the person the password
```

Password reset is the same office surface: `reset-member-password` → `updateUserById`.

## Passkey UI (post-MVP)

- Registration lives in workspace profile settings (`passkey-settings.tsx`): "Enable fingerprint sign-in" → `auth.registerPasskey()` → list/remove enrolled passkeys.
- Sign-in page gets a "Sign in with fingerprint" button → `auth.signInWithPasskey()` (discoverable credentials — no email field needed).
- Retry UX around `webauthn_challenge_expired` (user took too long at the biometric prompt).

## Family access (admission number + DOB)

Canonical architecture: [family-access.md](./family-access.md). Parent app / PWA: [mobile-app.md](../mobile-app.md).

**Parents and students** (option B) enter at `/[workspace]/sign-in` (How are you? → Parent or student, or `?who=family`) with **student admission number + student date of birth** — no password, no OTP for mass users. Safe only because the session is **read-only and data-minimal**. Family **app** URLs stay under `/family`.

- Form: `FamilySignInForm` → `familySignInAction` → `matchStudentForFamily` → `setFamilySessionCookie`.
- Admission match ignores hyphens/spaces. School from URL slug only; generic `"details don’t match"`; rate-limit IP + admission + slug.
- Cookie module `lib/tenancy/family-session.ts`. **`getSessionContext` never reads it.**
- After match: redirect to `/{slug}/family/home` hub ([family-surface.md](./family-surface.md)). Parent Add child + `parent_links.family_id` sibling group is Slice 2 (`0009` migrated).
- Family routes never get staff write powers.
- Escalation (optional later): phone OTP → bind a real `parent` `school_members` row (per-school opt-in).

Staff Add member / domain join stay on the directory and Team settings — do not route mass students through staff accounts (`provisionRoles` excludes `student`/`parent`).

## Testing checklist

- [x] Password sign-in/out, wrong-password error is generic
- [x] `/{slug}/sign-in`: How are you? → username (no school field) or family admission+DOB; `EBS-2024-006` + `2013-06-06` lands on `/family/home`; anonymous `/family` → `?who=family`; cookie does not open Team/Fees
- [ ] Email OTP request/verify happy path + expired code (not in product; password is the staff door)
- [x] Magic-link callback route exchanges code and redirects
- [x] Proxy: unauthenticated staff `/{slug}/*` redirects to `/{slug}/sign-in`; `/{slug}/family` stays public to Supabase
- [x] Parent Add child: EBS-2024-007 / 2012-07-07 after Reyansh; switcher; student viewer has no Add child
- [x] Add member: managers can provision; coordinator cannot create admin/coordinator; membership created with chosen role
- [x] Reset password: managers only; not self, not school_admin, not archived
- [x] Multi-school user sees switcher; each workspace evaluates role independently
- [ ] All auth actions call `revalidatePath("/", "layout")` (many revalidate a workspace path instead)
- [ ] `pnpm lint && pnpm check-types` green (full monorepo at Phase 0/1 exit)
