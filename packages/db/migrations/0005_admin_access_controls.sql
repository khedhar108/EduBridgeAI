-- Must commit before any policy/row uses 'coordinator' (same pattern as 0003 accountant).
ALTER TYPE "public"."app_role" ADD VALUE IF NOT EXISTS 'coordinator' BEFORE 'accountant';
