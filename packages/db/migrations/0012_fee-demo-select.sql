ALTER TABLE "schools" ADD COLUMN "country" varchar(2) DEFAULT 'IN' NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "state" varchar(80);--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "city" varchar(80);--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "pincode" varchar(6);--> statement-breakpoint
ALTER TABLE "fee_plans" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_country_format" CHECK ("schools"."country" ~ '^[A-Z]{2}$');--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_state_not_blank" CHECK ("schools"."state" is null or length(btrim("schools"."state")) between 2 and 80);--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_city_not_blank" CHECK ("schools"."city" is null or length(btrim("schools"."city")) between 2 and 80);--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_pincode_format" CHECK ("schools"."pincode" is null or "schools"."pincode" ~ '^[0-9]{6}$');--> statement-breakpoint

DROP POLICY IF EXISTS "fee_plans_select_money_roles" ON "fee_plans";--> statement-breakpoint
CREATE POLICY "fee_plans_select_money_roles"
ON "fee_plans" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant', 'coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

DROP POLICY IF EXISTS "fee_plan_versions_select_money_roles" ON "fee_plan_versions";--> statement-breakpoint
CREATE POLICY "fee_plan_versions_select_money_roles"
ON "fee_plan_versions" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant', 'coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

DROP POLICY IF EXISTS "student_fee_assignments_select_money_roles" ON "student_fee_assignments";--> statement-breakpoint
CREATE POLICY "student_fee_assignments_select_money_roles"
ON "student_fee_assignments" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant', 'coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

DROP POLICY IF EXISTS "fee_payments_select_money_roles" ON "fee_payments";--> statement-breakpoint
CREATE POLICY "fee_payments_select_money_roles"
ON "fee_payments" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant', 'coordinator']::public.app_role[]
  ))
);--> statement-breakpoint

DROP POLICY IF EXISTS "fee_audit_events_select_money_roles" ON "fee_audit_events";--> statement-breakpoint
CREATE POLICY "fee_audit_events_select_money_roles"
ON "fee_audit_events" FOR SELECT TO authenticated
USING (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'accountant', 'coordinator']::public.app_role[]
  ))
);