-- Must commit before any policy/row uses `accountant`.
ALTER TYPE "public"."app_role" ADD VALUE IF NOT EXISTS 'accountant';
