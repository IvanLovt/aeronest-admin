-- Удаляем старое ограничение внешнего ключа
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_address_id_delivery_addresses_id_fk";
--> statement-breakpoint
-- Разрешаем NULL для address_id
ALTER TABLE "orders" ALTER COLUMN "address_id" DROP NOT NULL;
--> statement-breakpoint
-- Создаем новое ограничение с onDelete set null
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_delivery_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."delivery_addresses"("id") ON DELETE set null ON UPDATE no action;
