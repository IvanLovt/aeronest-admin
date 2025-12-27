CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"ref_code" text NOT NULL,
	"user_id" text NOT NULL,
	"referred_user_id" text,
	"date" timestamp DEFAULT now() NOT NULL,
	"conditions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_ref_code_unique" UNIQUE("ref_code")
);
--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;