CREATE TYPE "public"."membership_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "membership_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"status" "membership_request_status" DEFAULT 'pending' NOT NULL,
	"activated_role" "app_role",
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_requests_email_lowercase" CHECK ("membership_requests"."email" = lower("membership_requests"."email")),
	CONSTRAINT "membership_requests_activated_role_not_owner" CHECK ("membership_requests"."activated_role" is null or "membership_requests"."activated_role" <> 'platform_owner'::app_role)
);
--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_requests_school_user_pending_unique" ON "membership_requests" USING btree ("school_id","user_id") WHERE "status" = 'pending';--> statement-breakpoint
CREATE INDEX "membership_requests_school_status_idx" ON "membership_requests" USING btree ("school_id","status");--> statement-breakpoint
CREATE INDEX "membership_requests_user_id_idx" ON "membership_requests" USING btree ("user_id");--> statement-breakpoint

REVOKE ALL ON TABLE "membership_requests" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "membership_requests" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "membership_requests" TO service_role;--> statement-breakpoint

ALTER TABLE "membership_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "membership_requests" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

-- Admins manage the queue for their school.
CREATE POLICY "membership_requests_select_for_admins"
ON "membership_requests"
FOR SELECT
TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
  OR user_id = (SELECT auth.uid())
);--> statement-breakpoint

-- Inserts for domain join use privileged bootstrap (getDb); this policy
-- allows a future authenticated self-insert path if needed.
CREATE POLICY "membership_requests_insert_for_self"
ON "membership_requests"
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND status = 'pending'::public.membership_request_status
);--> statement-breakpoint

CREATE POLICY "membership_requests_update_for_admins"
ON "membership_requests"
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
);
