-- Student registration + versioned fee ledger (requires 0003 accountant enum).
-- Fee plan versions are INSERT-only for money roles; existing student
-- assignments stay pinned to the version used at registration.

CREATE TYPE "public"."fee_payment_mode" AS ENUM('once', 'quarterly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."fee_payment_method" AS ENUM('cash', 'upi', 'bank_transfer', 'cheque', 'other');--> statement-breakpoint

CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"admission_number" varchar(64) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"date_of_birth" date NOT NULL,
	"photo_url" text,
	"class_label" varchar(64),
	"profile_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_full_name_not_blank" CHECK (length(btrim("students"."full_name")) between 2 and 160),
	CONSTRAINT "students_admission_number_not_blank" CHECK (length(btrim("students"."admission_number")) > 0)
);
--> statement-breakpoint
CREATE TABLE "student_guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"relationship" varchar(64) NOT NULL,
	"phone" varchar(32),
	"email" varchar(320),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_guardians_full_name_not_blank" CHECK (length(btrim("student_guardians"."full_name")) between 2 and 160)
);
--> statement-breakpoint
CREATE TABLE "fee_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"class_label" varchar(64),
	"payment_mode" "fee_payment_mode" DEFAULT 'once' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fee_plans_name_not_blank" CHECK (length(btrim("fee_plans"."name")) between 2 and 160)
);
--> statement-breakpoint
CREATE TABLE "fee_plan_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"payment_mode" "fee_payment_mode" NOT NULL,
	"heads" jsonb NOT NULL,
	"total_amount_inr" integer NOT NULL,
	"note" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fee_plan_versions_version_positive" CHECK ("fee_plan_versions"."version" > 0),
	CONSTRAINT "fee_plan_versions_total_non_negative" CHECK ("fee_plan_versions"."total_amount_inr" >= 0)
);
--> statement-breakpoint
CREATE TABLE "student_fee_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"plan_version_id" uuid NOT NULL,
	"concession_percent" integer DEFAULT 0 NOT NULL,
	"concession_note" text,
	"assigned_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_fee_assignments_concession_range" CHECK ("student_fee_assignments"."concession_percent" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "fee_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"assignment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"amount_inr" integer NOT NULL,
	"method" "fee_payment_method" DEFAULT 'cash' NOT NULL,
	"reference" varchar(120),
	"note" text,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fee_payments_amount_positive" CHECK ("fee_payments"."amount_inr" > 0)
);
--> statement-breakpoint
CREATE TABLE "fee_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" varchar(64) NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" uuid,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plan_versions" ADD CONSTRAINT "fee_plan_versions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plan_versions" ADD CONSTRAINT "fee_plan_versions_plan_id_fee_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."fee_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plan_versions" ADD CONSTRAINT "fee_plan_versions_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_plan_version_id_fee_plan_versions_id_fk" FOREIGN KEY ("plan_version_id") REFERENCES "public"."fee_plan_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_assigned_by_profiles_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_assignment_id_student_fee_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."student_fee_assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_audit_events" ADD CONSTRAINT "fee_audit_events_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_audit_events" ADD CONSTRAINT "fee_audit_events_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX "students_school_admission_number_unique" ON "students" USING btree ("school_id","admission_number");--> statement-breakpoint
CREATE INDEX "students_school_id_idx" ON "students" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "student_guardians_student_id_idx" ON "student_guardians" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_guardians_school_id_idx" ON "student_guardians" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "fee_plans_school_id_idx" ON "fee_plans" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fee_plan_versions_plan_version_unique" ON "fee_plan_versions" USING btree ("plan_id","version");--> statement-breakpoint
CREATE INDEX "fee_plan_versions_school_id_idx" ON "fee_plan_versions" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_fee_assignments_student_unique" ON "student_fee_assignments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_fee_assignments_school_id_idx" ON "student_fee_assignments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "fee_payments_school_id_idx" ON "fee_payments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "fee_payments_student_id_idx" ON "fee_payments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "fee_payments_assignment_id_idx" ON "fee_payments" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "fee_audit_events_school_created_idx" ON "fee_audit_events" USING btree ("school_id","created_at");--> statement-breakpoint

-- Grants + RLS: school_admin + accountant for money tables; members can read students they share a school with.

REVOKE ALL ON TABLE "students" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "student_guardians" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "fee_plans" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "fee_plan_versions" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "student_fee_assignments" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "fee_payments" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "fee_audit_events" FROM anon, authenticated;--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE ON TABLE "students" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "student_guardians" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "fee_plans" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT ON TABLE "fee_plan_versions" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "student_fee_assignments" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT ON TABLE "fee_payments" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT ON TABLE "fee_audit_events" TO authenticated;--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "students" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "student_guardians" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "fee_plans" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "fee_plan_versions" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "student_fee_assignments" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "fee_payments" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "fee_audit_events" TO service_role;--> statement-breakpoint

ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "students" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_guardians" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_guardians" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_plans" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_plan_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_plan_versions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_payments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_audit_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fee_audit_events" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "students_select_members"
ON "students" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "students_write_admin_accountant"
ON "students" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "student_guardians_select_members"
ON "student_guardians" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "student_guardians_write_admin_accountant"
ON "student_guardians" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_plans_select_money_roles"
ON "fee_plans" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_plans_write_money_roles"
ON "fee_plans" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_plan_versions_select_money_roles"
ON "fee_plan_versions" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_plan_versions_insert_money_roles"
ON "fee_plan_versions" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "student_fee_assignments_select_money_roles"
ON "student_fee_assignments" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "student_fee_assignments_write_money_roles"
ON "student_fee_assignments" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_payments_select_money_roles"
ON "fee_payments" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_payments_insert_money_roles"
ON "fee_payments" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_audit_events_select_money_roles"
ON "fee_audit_events" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "fee_audit_events_insert_money_roles"
ON "fee_audit_events" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant']::public.app_role[]
  ))
);
