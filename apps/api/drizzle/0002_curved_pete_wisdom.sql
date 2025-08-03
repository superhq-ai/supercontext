CREATE TABLE IF NOT EXISTS "memory_access_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"memory_id" text NOT NULL,
	"api_key_id" text NOT NULL,
	"accessed_at" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memory_access_log" ADD CONSTRAINT "memory_access_log_memory_id_memory_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."memory"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memory_access_log" ADD CONSTRAINT "memory_access_log_api_key_id_api_key_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_key"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
