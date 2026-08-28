CREATE TABLE "parent_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"family_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parent_links" ADD CONSTRAINT "parent_links_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_links" ADD CONSTRAINT "parent_links_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "parent_links_family_student_unique" ON "parent_links" USING btree ("school_id","family_id","student_id");--> statement-breakpoint
CREATE INDEX "parent_links_school_id_idx" ON "parent_links" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "parent_links_family_id_idx" ON "parent_links" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "parent_links_student_id_idx" ON "parent_links" USING btree ("student_id");--> statement-breakpoint

REVOKE ALL ON TABLE "parent_links" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "parent_links" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "parent_links" TO service_role;--> statement-breakpoint

ALTER TABLE "parent_links" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "parent_links" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "parent_links_select_members"
ON "parent_links" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "parent_links_write_admin"
ON "parent_links" FOR ALL TO authenticated
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