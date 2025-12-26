CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'CONFIRMED', 'IN_FLIGHT', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "delivery_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"street" text NOT NULL,
	"building" text,
	"entrance" text,
	"floor" text,
	"apartment" text,
	"comment" text,
	"coords" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"address_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"items" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text,
	"email_verified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"referrer_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "delivery_addresses" ADD CONSTRAINT "delivery_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_delivery_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."delivery_addresses"("id") ON DELETE restrict ON UPDATE no action;