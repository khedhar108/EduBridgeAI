CREATE TABLE "admin_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" varchar(64) NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" uuid,
	"target_user_id" uuid,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_audit_events_action_not_blank" CHECK (length(btrim("admin_audit_events"."action")) between 2 and 64)
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email" varchar(320);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "username" varchar(64);--> statement-breakpoint
ALTER TABLE "school_members" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "admin_audit_events_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "admin_audit_events_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "admin_audit_events_target_user_id_profiles_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_events_school_created_idx" ON "admin_audit_events" USING btree ("school_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_unique" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_unique" ON "profiles" USING btree ("username");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_email_lowercase" CHECK ("profiles"."email" is null or "profiles"."email" = lower("profiles"."email"));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_format" CHECK ("profiles"."username" is null or "profiles"."username" ~ '^[a-z0-9](?:[a-z0-9._-]{1,62}[a-z0-9])$');--> statement-breakpoint

-- ============================================================
-- RLS extension (appended per AGENTS.md rule 13):
-- coordinator role, is_active gate, admin_audit_events table.
-- ============================================================

-- 1. Membership helpers now require active membership.
--    Deactivation takes effect on the next request — no session revocation.
CREATE OR REPLACE FUNCTION "private"."is_school_member"(target_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.school_members AS member
      WHERE member.school_id = target_school_id
        AND member.user_id = (SELECT auth.uid())
        AND member.is_active = true
    );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "private"."has_school_role"(
  target_school_id uuid,
  allowed_roles public.app_role[]
)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.school_members AS member
      WHERE member.school_id = target_school_id
        AND member.user_id = (SELECT auth.uid())
        AND member.is_active = true
        AND member.role = ANY(allowed_roles)
    );
$$;--> statement-breakpoint

-- 2. school_members: coordinator can insert/update non-admin members.
--    Admins retain full power (OR short-circuits the role guard).
DROP POLICY IF EXISTS "school_members_insert_for_admins" ON "school_members";--> statement-breakpoint
CREATE POLICY "school_members_insert_for_managers"
ON "school_members" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  AND (
    (SELECT private.has_school_role(
      school_id, ARRAY['school_admin']::public.app_role[]
    ))
    OR (role <> 'school_admin'::public.app_role
        AND role <> 'coordinator'::public.app_role)
  )
);--> statement-breakpoint

DROP POLICY IF EXISTS "school_members_update_for_admins" ON "school_members";--> statement-breakpoint
CREATE POLICY "school_members_update_for_managers"
ON "school_members" FOR UPDATE TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  AND (
    (SELECT private.has_school_role(
      school_id, ARRAY['school_admin']::public.app_role[]
    ))
    OR (role <> 'school_admin'::public.app_role
        AND role <> 'coordinator'::public.app_role)
  )
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  AND (
    (SELECT private.has_school_role(
      school_id, ARRAY['school_admin']::public.app_role[]
    ))
    OR (role <> 'school_admin'::public.app_role
        AND role <> 'coordinator'::public.app_role)
  )
);--> statement-breakpoint

-- 3. invitations: coordinator can manage invitations (non-admin roles only).
DROP POLICY IF EXISTS "invitations_select_for_admins" ON "invitations";--> statement-breakpoint
CREATE POLICY "invitations_select_for_managers"
ON "invitations" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

DROP POLICY IF EXISTS "invitations_insert_for_admins" ON "invitations";--> statement-breakpoint
CREATE POLICY "invitations_insert_for_managers"
ON "invitations" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  AND invited_by = (SELECT auth.uid())
  AND (
    (SELECT private.has_school_role(
      school_id, ARRAY['school_admin']::public.app_role[]
    ))
    OR (role <> 'school_admin'::public.app_role
        AND role <> 'coordinator'::public.app_role)
  )
  AND role <> 'platform_owner'::public.app_role
);--> statement-breakpoint

DROP POLICY IF EXISTS "invitations_update_for_admins" ON "invitations";--> statement-breakpoint
CREATE POLICY "invitations_update_for_managers"
ON "invitations" FOR UPDATE TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

-- 4. membership_requests: coordinator can review the queue (non-admin roles).
DROP POLICY IF EXISTS "membership_requests_select_for_admins" ON "membership_requests";--> statement-breakpoint
CREATE POLICY "membership_requests_select_for_managers"
ON "membership_requests" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  OR user_id = (SELECT auth.uid())
);--> statement-breakpoint

DROP POLICY IF EXISTS "membership_requests_update_for_admins" ON "membership_requests";--> statement-breakpoint
CREATE POLICY "membership_requests_update_for_managers"
ON "membership_requests" FOR UPDATE TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  AND (
    (SELECT private.has_school_role(
      school_id, ARRAY['school_admin']::public.app_role[]
    ))
    OR activated_role IS NULL
    OR (activated_role <> 'school_admin'::public.app_role
        AND activated_role <> 'coordinator'::public.app_role)
  )
);--> statement-breakpoint

-- 5. admin_audit_events: append-only privileged-action log.
REVOKE ALL ON TABLE "admin_audit_events" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT ON TABLE "admin_audit_events" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "admin_audit_events" TO service_role;--> statement-breakpoint

ALTER TABLE "admin_audit_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_audit_events" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "admin_audit_events_select_for_managers"
ON "admin_audit_events" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "admin_audit_events_insert_for_managers"
ON "admin_audit_events" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin','coordinator']::public.app_role[]
  ))
  AND actor_id = (SELECT auth.uid())
);--> statement-breakpoint