ALTER TABLE "profiles" DROP CONSTRAINT "profiles_username_format";--> statement-breakpoint
DROP INDEX "profiles_username_unique";--> statement-breakpoint
ALTER TABLE "school_members" ADD COLUMN "username" varchar(32);--> statement-breakpoint
ALTER TABLE "membership_requests" ADD COLUMN "username" varchar(32);--> statement-breakpoint
CREATE UNIQUE INDEX "school_members_school_username_unique" ON "school_members" USING btree ("school_id","username") WHERE "school_members"."username" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_requests_school_username_unique" ON "membership_requests" USING btree ("school_id","username") WHERE "membership_requests"."username" is not null;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_username_format" CHECK ("school_members"."username" is null or "school_members"."username" ~ '^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$');