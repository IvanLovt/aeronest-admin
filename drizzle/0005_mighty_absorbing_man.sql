CREATE TABLE "referral_uses" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "max_uses" text;--> statement-breakpoint
ALTER TABLE "referral_uses" ADD CONSTRAINT "referral_uses_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_uses" ADD CONSTRAINT "referral_uses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;