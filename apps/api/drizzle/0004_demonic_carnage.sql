CREATE TABLE IF NOT EXISTS "memories_to_spaces" (
	"memory_id" text NOT NULL,
	"space_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memory" DROP CONSTRAINT "memory_space_id_space_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memories_to_spaces" ADD CONSTRAINT "memories_to_spaces_memory_id_memory_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."memory"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memories_to_spaces" ADD CONSTRAINT "memories_to_spaces_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "memory" DROP COLUMN IF EXISTS "space_id";