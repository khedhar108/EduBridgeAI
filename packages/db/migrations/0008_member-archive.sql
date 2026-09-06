ALTER TABLE "school_members" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "school_members" ADD COLUMN "archived_by" uuid;--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_archived_by_profiles_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_archive_actor_required" CHECK ("school_members"."archived_at" is null or "school_members"."archived_by" is not null);--> statement-breakpoint
CREATE UNIQUE INDEX "school_members_one_admin_per_school" ON "school_members" USING btree ("school_id") WHERE "school_members"."role" = 'school_admin' AND "school_members"."archived_at" is null;--> statement-breakpoint

-- ============================================================
-- RLS extension (appended after generate — policies/grants/helpers only):
-- terminal archive gate, no hard DELETE, split manager UPDATE policies.
-- ============================================================

-- 1. Membership helpers require active AND non-archived membership.
--    Archive takes effect on the next request — no session revocation.
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
        AND member.archived_at IS NULL
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
        AND member.archived_at IS NULL
        AND member.role = ANY(allowed_roles)
    );
$$;--> statement-breakpoint

-- 2. No tenant role may hard-delete a membership.
DROP POLICY IF EXISTS "school_members_delete_for_admins" ON "school_members";--> statement-breakpoint
REVOKE DELETE ON TABLE "school_members" FROM authenticated;--> statement-breakpoint

-- 3. Split UPDATE: admins may archive; coordinators may only toggle is_active
--    on live non-admin / non-coordinator rows (cannot write archive columns).
DROP POLICY IF EXISTS "school_members_update_for_managers" ON "school_members";--> statement-breakpoint

CREATE POLICY "school_members_update_for_admins"
ON "school_members" FOR UPDATE TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['school_admin']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "school_members_update_for_coordinators"
ON "school_members" FOR UPDATE TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id, ARRAY['coordinator']::public.app_role[]
  ))
  AND role <> 'school_admin'::public.app_role
  AND role <> 'coordinator'::public.app_role
  AND archived_at IS NULL
  AND archived_by IS NULL
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id, ARRAY['coordinator']::public.app_role[]
  ))
  AND role <> 'school_admin'::public.app_role
  AND role <> 'coordinator'::public.app_role
  AND archived_at IS NULL
  AND archived_by IS NULL
);