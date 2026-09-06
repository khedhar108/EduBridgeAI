CREATE TYPE "public"."assessment_type" AS ENUM('periodic', 'term', 'other');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late');--> statement-breakpoint
CREATE TYPE "public"."share_channel" AS ENUM('whatsapp');--> statement-breakpoint
CREATE TYPE "public"."share_request_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"student_id" uuid,
	"category" varchar(64) NOT NULL,
	"note" text NOT NULL,
	"occurred_on" date NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_category_not_blank" CHECK (length(btrim("activities"."category")) between 2 and 64),
	CONSTRAINT "activities_note_not_blank" CHECK (length(btrim("activities"."note")) between 2 and 4000)
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"class_subject_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"type" "assessment_type" NOT NULL,
	"max_marks" integer NOT NULL,
	"on_date" date NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessments_name_not_blank" CHECK (length(btrim("assessments"."name")) between 2 and 160),
	CONSTRAINT "assessments_max_marks_positive" CHECK ("assessments"."max_marks" > 0)
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"on_date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_staff_delegations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" varchar(64) NOT NULL,
	"section" varchar(16) DEFAULT 'A' NOT NULL,
	"academic_year" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_name_not_blank" CHECK (length(btrim("classes"."name")) between 1 and 64),
	CONSTRAINT "classes_section_not_blank" CHECK (length(btrim("classes"."section")) between 1 and 16),
	CONSTRAINT "classes_academic_year_not_blank" CHECK (length(btrim("classes"."academic_year")) between 4 and 16)
);
--> statement-breakpoint
CREATE TABLE "marks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marks_score_non_negative" CHECK ("marks"."score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "share_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"requested_by" uuid,
	"channel" "share_channel" DEFAULT 'whatsapp' NOT NULL,
	"status" "share_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"code" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_name_not_blank" CHECK (length(btrim("subjects"."name")) between 2 and 80)
);
--> statement-breakpoint
CREATE TABLE "teacher_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_subject_id" uuid NOT NULL,
	"teacher_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_class_subject_id_class_subjects_id_fk" FOREIGN KEY ("class_subject_id") REFERENCES "public"."class_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_staff_delegations" ADD CONSTRAINT "class_staff_delegations_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_staff_delegations" ADD CONSTRAINT "class_staff_delegations_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_staff_delegations" ADD CONSTRAINT "class_staff_delegations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_requests" ADD CONSTRAINT "share_requests_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_requests" ADD CONSTRAINT "share_requests_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_requests" ADD CONSTRAINT "share_requests_requested_by_profiles_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_subject_id_class_subjects_id_fk" FOREIGN KEY ("class_subject_id") REFERENCES "public"."class_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_user_id_profiles_id_fk" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_school_id_idx" ON "activities" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "activities_class_id_idx" ON "activities" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "activities_student_id_idx" ON "activities" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "assessments_school_id_idx" ON "assessments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "assessments_class_id_idx" ON "assessments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "assessments_class_subject_id_idx" ON "assessments" USING btree ("class_subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_records_class_student_date_unique" ON "attendance_records" USING btree ("school_id","class_id","student_id","on_date");--> statement-breakpoint
CREATE INDEX "attendance_records_school_id_idx" ON "attendance_records" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "attendance_records_class_date_idx" ON "attendance_records" USING btree ("class_id","on_date");--> statement-breakpoint
CREATE INDEX "attendance_records_student_id_idx" ON "attendance_records" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "class_enrollments_class_student_unique" ON "class_enrollments" USING btree ("school_id","class_id","student_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_school_id_idx" ON "class_enrollments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_class_id_idx" ON "class_enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_student_id_idx" ON "class_enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "class_staff_delegations_class_user_unique" ON "class_staff_delegations" USING btree ("school_id","class_id","user_id");--> statement-breakpoint
CREATE INDEX "class_staff_delegations_school_id_idx" ON "class_staff_delegations" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "class_staff_delegations_class_id_idx" ON "class_staff_delegations" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "class_staff_delegations_user_id_idx" ON "class_staff_delegations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "class_subjects_class_subject_unique" ON "class_subjects" USING btree ("school_id","class_id","subject_id");--> statement-breakpoint
CREATE INDEX "class_subjects_school_id_idx" ON "class_subjects" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "class_subjects_class_id_idx" ON "class_subjects" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "class_subjects_subject_id_idx" ON "class_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "classes_school_year_name_section_unique" ON "classes" USING btree ("school_id","academic_year","name","section");--> statement-breakpoint
CREATE INDEX "classes_school_id_idx" ON "classes" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "marks_assessment_student_unique" ON "marks" USING btree ("school_id","assessment_id","student_id");--> statement-breakpoint
CREATE INDEX "marks_school_id_idx" ON "marks" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "marks_class_id_idx" ON "marks" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "marks_student_id_idx" ON "marks" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "share_requests_school_id_idx" ON "share_requests" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "share_requests_student_id_idx" ON "share_requests" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_school_name_unique" ON "subjects" USING btree ("school_id","name");--> statement-breakpoint
CREATE INDEX "subjects_school_id_idx" ON "subjects" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_assignments_offering_teacher_unique" ON "teacher_assignments" USING btree ("school_id","class_subject_id","teacher_user_id");--> statement-breakpoint
CREATE INDEX "teacher_assignments_school_id_idx" ON "teacher_assignments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "teacher_assignments_teacher_user_id_idx" ON "teacher_assignments" USING btree ("teacher_user_id");--> statement-breakpoint
CREATE INDEX "teacher_assignments_class_subject_id_idx" ON "teacher_assignments" USING btree ("class_subject_id");--> statement-breakpoint

REVOKE ALL ON TABLE "classes" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "subjects" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "class_subjects" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "teacher_assignments" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "class_staff_delegations" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "class_enrollments" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "attendance_records" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "assessments" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "marks" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "activities" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "share_requests" FROM anon, authenticated;--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "classes" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "subjects" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "class_subjects" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "teacher_assignments" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "class_staff_delegations" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "class_enrollments" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "attendance_records" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "assessments" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "marks" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "activities" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "share_requests" TO authenticated;--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "classes" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "subjects" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "class_subjects" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "teacher_assignments" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "class_staff_delegations" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "class_enrollments" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "attendance_records" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "assessments" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "marks" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "activities" TO service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "share_requests" TO service_role;--> statement-breakpoint

ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "classes" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subjects" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_subjects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_subjects" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teacher_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teacher_assignments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_staff_delegations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_staff_delegations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_enrollments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_enrollments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendance_records" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assessments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assessments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "marks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "marks" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "activities" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "share_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "share_requests" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "private"."can_access_class"(
  target_school_id uuid,
  target_class_id uuid
)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND (
      private.has_school_role(
        target_school_id,
        ARRAY['school_admin']::public.app_role[]
      )
      OR EXISTS (
        SELECT 1
        FROM public.teacher_assignments AS assignment
        INNER JOIN public.class_subjects AS offering
          ON offering.id = assignment.class_subject_id
        WHERE assignment.school_id = target_school_id
          AND offering.class_id = target_class_id
          AND assignment.teacher_user_id = (SELECT auth.uid())
      )
      OR EXISTS (
        SELECT 1
        FROM public.class_staff_delegations AS delegation
        WHERE delegation.school_id = target_school_id
          AND delegation.class_id = target_class_id
          AND delegation.user_id = (SELECT auth.uid())
      )
    );
$$;--> statement-breakpoint

REVOKE EXECUTE ON FUNCTION "private"."can_access_class"(uuid, uuid)
  FROM PUBLIC, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "private"."can_access_class"(uuid, uuid)
  TO authenticated, service_role;--> statement-breakpoint

CREATE POLICY "subjects_select_members"
ON "subjects" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "subjects_write_admin"
ON "subjects" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
);--> statement-breakpoint

CREATE POLICY "classes_select_assigned"
ON "classes" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, id)));--> statement-breakpoint

CREATE POLICY "classes_write_admin"
ON "classes" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
);--> statement-breakpoint

CREATE POLICY "class_subjects_select_assigned"
ON "class_subjects" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, class_id)));--> statement-breakpoint

CREATE POLICY "class_subjects_write_admin"
ON "class_subjects" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
);--> statement-breakpoint

CREATE POLICY "teacher_assignments_select_members"
ON "teacher_assignments" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "teacher_assignments_write_admin"
ON "teacher_assignments" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
);--> statement-breakpoint

CREATE POLICY "class_staff_delegations_select_members"
ON "class_staff_delegations" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "class_staff_delegations_write_admin"
ON "class_staff_delegations" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
);--> statement-breakpoint

CREATE POLICY "class_enrollments_select_assigned"
ON "class_enrollments" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, class_id)));--> statement-breakpoint

CREATE POLICY "class_enrollments_write_admin"
ON "class_enrollments" FOR ALL TO authenticated
USING (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT private.has_school_role(school_id, ARRAY['school_admin']::public.app_role[]))
);--> statement-breakpoint

CREATE POLICY "attendance_records_select_assigned"
ON "attendance_records" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, class_id)));--> statement-breakpoint

CREATE POLICY "attendance_records_write_entry_roles"
ON "attendance_records" FOR ALL TO authenticated
USING (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher', 'staff']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher', 'staff']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "assessments_select_assigned"
ON "assessments" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, class_id)));--> statement-breakpoint

CREATE POLICY "assessments_write_marks_roles"
ON "assessments" FOR ALL TO authenticated
USING (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "marks_select_assigned"
ON "marks" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, class_id)));--> statement-breakpoint

CREATE POLICY "marks_write_marks_roles"
ON "marks" FOR ALL TO authenticated
USING (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "activities_select_assigned"
ON "activities" FOR SELECT TO authenticated
USING ((SELECT private.can_access_class(school_id, class_id)));--> statement-breakpoint

CREATE POLICY "activities_write_entry_roles"
ON "activities" FOR ALL TO authenticated
USING (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher', 'staff']::public.app_role[]
  ))
)
WITH CHECK (
  (SELECT private.can_access_class(school_id, class_id))
  AND (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher', 'staff']::public.app_role[]
  ))
);--> statement-breakpoint

CREATE POLICY "share_requests_select_members"
ON "share_requests" FOR SELECT TO authenticated
USING ((SELECT private.is_school_member(school_id)));--> statement-breakpoint

CREATE POLICY "share_requests_insert_staff"
ON "share_requests" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT private.has_school_role(
    school_id,
    ARRAY['school_admin', 'teacher']::public.app_role[]
  ))
);