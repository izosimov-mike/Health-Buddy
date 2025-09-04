CREATE TABLE IF NOT EXISTS "nft_mints" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"level" integer NOT NULL,
	"transaction_hash" text NOT NULL,
	"contract_address" text NOT NULL,
	"token_id" integer NOT NULL,
	"minted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_level_unique" ON "nft_mints" USING btree ("user_id","level");