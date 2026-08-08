CREATE TYPE "public"."app_role" AS ENUM('platform_owner', 'school_admin', 'teacher', 'staff', 'student', 'parent');--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"official_email_domain" varchar(253) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_name_not_blank" CHECK (length(btrim("schools"."name")) between 2 and 160),
	CONSTRAINT "schools_slug_format" CHECK ("schools"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*-bridge$'),
	CONSTRAINT "schools_email_domain_format" CHECK ("schools"."official_email_domain" = lower("schools"."official_email_domain")
        and "schools"."official_email_domain" ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$')
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"phone" varchar(32),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_full_name_not_blank" CHECK (length(btrim("profiles"."full_name")) between 2 and 160),
	CONSTRAINT "profiles_phone_not_blank" CHECK ("profiles"."phone" is null or length(btrim("profiles"."phone")) > 0)
);
--> statement-breakpoint
CREATE TABLE "school_members" (
	"school_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "school_members_school_id_user_id_pk" PRIMARY KEY("school_id","user_id"),
	CONSTRAINT "school_members_platform_owner_forbidden" CHECK ("school_members"."role" <> 'platform_owner'::app_role)
);
--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "schools_slug_unique" ON "schools" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "schools_official_email_domain_unique" ON "schools" USING btree ("official_email_domain");--> statement-breakpoint
CREATE INDEX "school_members_user_id_idx" ON "school_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "school_members_school_id_role_idx" ON "school_members" USING btree ("school_id","role");--> statement-breakpoint

-- `profiles.id` is owned by Supabase Auth. This FK is SQL-only so Drizzle
-- never tries to manage the existing `auth.users` table.
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_auth_users_id_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade;--> statement-breakpoint

-- Private helpers avoid recursive RLS checks on school_members. The schema is
-- not exposed by the Supabase Data API.
CREATE SCHEMA IF NOT EXISTS "private";--> statement-breakpoint
REVOKE ALL ON SCHEMA "private" FROM PUBLIC, anon, authenticated;--> statement-breakpoint
GRANT USAGE ON SCHEMA "private" TO authenticated;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "private"."is_school_member"(target_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.school_members AS member
      WHERE member.school_id = target_school_id
        AND member.user_id = (SELECT auth.uid())
    );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "private"."has_school_role"(
  target_school_id uuid,
  allowed_roles public.app_role[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.school_members AS member
      WHERE member.school_id = target_school_id
        AND member.user_id = (SELECT auth.uid())
        AND member.role = ANY(allowed_roles)
    );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "private"."shares_school_with"(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.school_members AS mine
      INNER JOIN public.school_members AS theirs
        ON theirs.school_id = mine.school_id
      WHERE mine.user_id = (SELECT auth.uid())
        AND theirs.user_id = target_user_id
    );
$$;--> statement-breakpoint

REVOKE EXECUTE ON FUNCTION "private"."is_school_member"(uuid)
  FROM PUBLIC, anon, authenticated;--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "private"."has_school_role"(uuid, public.app_role[])
  FROM PUBLIC, anon, authenticated;--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "private"."shares_school_with"(uuid)
  FROM PUBLIC, anon, authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "private"."is_school_member"(uuid)
  TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "private"."has_school_role"(uuid, public.app_role[])
  TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "private"."shares_school_with"(uuid)
  TO authenticated;--> statement-breakpoint
GRANT USAGE ON TYPE "public"."app_role" TO authenticated;--> statement-breakpoint

-- Make exposure opt-in. `anon` receives no access to tenant data.
REVOKE ALL ON TABLE "schools", "profiles", "school_members"
  FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, UPDATE ON TABLE "schools" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "profiles" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "school_members"
  TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  "schools", "profiles", "school_members" TO service_role;--> statement-breakpoint

ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "schools" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "school_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "school_members" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "schools_select_for_members"
ON "schools"
FOR SELECT
TO authenticated
USING ((SELECT private.is_school_member(id)));--> statement-breakpoint

CREATE POLICY "schools_update_for_admins"
ON "schools"
FOR UPDATE
TO authenticated
USING (
  (SELECT private.has_school_role(
    id,
    ARRAY['school_admin']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    id,
    ARRAY['school_admin']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "profiles_select_for_self_or_co_members"
ON "profiles"
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT private.shares_school_with(id))
);--> statement-breakpoint

CREATE POLICY "profiles_insert_for_self"
ON "profiles"
FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));--> statement-breakpoint

CREATE POLICY "profiles_update_for_self"
ON "profiles"
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));--> statement-breakpoint

CREATE POLICY "school_members_select_for_members"
ON "school_members"
FOR SELECT
TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "school_members_insert_for_admins"
ON "school_members"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "school_members_update_for_admins"
ON "school_members"
FOR UPDATE
TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "school_members_delete_for_admins"
ON "school_members"
FOR DELETE
TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
);