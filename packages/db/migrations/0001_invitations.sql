CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"role" "app_role" NOT NULL,
	"token" varchar(64) NOT NULL,
	"invited_by" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_platform_owner_forbidden" CHECK ("invitations"."role" <> 'platform_owner'::app_role),
	CONSTRAINT "invitations_email_lowercase" CHECK ("invitations"."email" = lower("invitations"."email"))
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_unique" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_school_email_pending_unique" ON "invitations" USING btree ("school_id","email") WHERE "accepted_at" is null;--> statement-breakpoint
CREATE INDEX "invitations_school_id_idx" ON "invitations" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint

REVOKE ALL ON TABLE "invitations" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "invitations" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "invitations" TO service_role;--> statement-breakpoint

ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "invitations_select_for_admins"
ON "invitations"
FOR SELECT
TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "invitations_insert_for_admins"
ON "invitations"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin']::public.app_role[]
  ))
  AND invited_by = (SELECT auth.uid())
  AND role <> 'platform_owner'::public.app_role
);--> statement-breakpoint

CREATE POLICY "invitations_update_for_admins"
ON "invitations"
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
