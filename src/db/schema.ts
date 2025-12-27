import {
  pgTable,
  text,
  timestamp,
  decimal,
  boolean,
  json,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Enum для статуса заказа
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "IN_FLIGHT",
  "DELIVERED",
  "CANCELLED",
]);

// Таблица пользователей
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  referrerId: text("referrer_id"),
});

// Таблица адресов доставки
export const deliveryAddresses = pgTable("delivery_addresses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // "Дом", "Офис"
  street: text("street").notNull(),
  building: text("building"),
  entrance: text("entrance"),
  floor: text("floor"),
  apartment: text("apartment"),
  comment: text("comment"),
  coords: text("coords").notNull(), // JSON: "[56.123,47.456]" или отдельные lat/lon
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Таблица заказов
export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  addressId: text("address_id").references(() => deliveryAddresses.id, {
    onDelete: "set null",
  }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  items: json("items").notNull(), // JSON массив элементов заказа
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations (связи между таблицами)
export const usersRelations = relations(users, ({ one, many }) => ({
  referrer: one(users, {
    fields: [users.referrerId],
    references: [users.id],
    relationName: "referrals",
  }),
  referrals: many(users, {
    relationName: "referrals",
  }),
  addresses: many(deliveryAddresses),
  orders: many(orders),
  referralCodes: many(referrals, {
    relationName: "referralCodes",
  }),
  referredBy: one(referrals, {
    fields: [users.id],
    references: [referrals.referredUserId],
    relationName: "referredBy",
  }),
}));

export const deliveryAddressesRelations = relations(
  deliveryAddresses,
  ({ one, many }) => ({
    user: one(users, {
      fields: [deliveryAddresses.userId],
      references: [users.id],
    }),
    orders: many(orders),
  })
);

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(deliveryAddresses, {
    fields: [orders.addressId],
    references: [deliveryAddresses.id],
  }),
}));

// Таблицы для NextAuth
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: timestamp("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.identifier, table.token],
    }),
  })
);

// Relations для NextAuth таблиц
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Таблица партнеров
export const partners = pgTable("partners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  image: text("image").notNull(), // URL или путь к изображению
  cooperationDate: timestamp("cooperation_date").notNull(), // Дата начала сотрудничества
  description: text("description").notNull(), // Мини описание
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
});

// Relations для партнеров (если понадобятся связи в будущем)
export const partnersRelations = relations(partners, () => ({
  // Можно добавить связи с заказами или другими таблицами при необходимости
}));

// Таблица каталога партнеров
export const catalog = pgTable("catalog", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  category: text("category").notNull(), // food, rest, med, other
  minOrder: text("min_order").notNull(), // "499 ₽"
  deliveryTime: text("delivery_time").notNull(), // "7–15 мин"
  iconName: text("icon_name"), // Название иконки вместо эмодзи (например "shopping-cart", "pizza")
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
});

// Таблица товаров (items)
export const items = pgTable("items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  catalogId: text("catalog_id")
    .notNull()
    .references(() => catalog.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  ves: text("ves").notNull(), // Вес товара (например, "500г", "1кг")
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
});

// Relations для каталога
export const catalogRelations = relations(catalog, ({ many }) => ({
  items: many(items),
}));

// Relations для товаров
export const itemsRelations = relations(items, ({ one }) => ({
  catalog: one(catalog, {
    fields: [items.catalogId],
    references: [catalog.id],
  }),
}));

// Таблица рефералов
export const referrals = pgTable("referrals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  refCode: text("ref_code").notNull().unique(), // Реферальный код (уникальный)
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Пользователь, которому принадлежит refCode
  referredUserId: text("referred_user_id").references(() => users.id, {
    onDelete: "set null",
  }), // Пользователь, который зарегистрировался по этому refCode (для обратной совместимости)
  date: timestamp("date").notNull().defaultNow(), // Дата регистрации по реферальному коду
  conditions: text("conditions"), // Условия (можно хранить JSON строку или текст)
  maxUses: text("max_uses"), // Максимальное количество использований (null = без ограничений)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
});

// Таблица для отслеживания использований реферальных кодов
export const referralUses = pgTable("referral_uses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  referralId: text("referral_id")
    .notNull()
    .references(() => referrals.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations для рефералов
export const referralsRelations = relations(referrals, ({ one, many }) => ({
  user: one(users, {
    fields: [referrals.userId],
    references: [users.id],
    relationName: "referralCodes",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referredBy",
  }),
  uses: many(referralUses),
}));

// Relations для использований реферальных кодов
export const referralUsesRelations = relations(referralUses, ({ one }) => ({
  referral: one(referrals, {
    fields: [referralUses.referralId],
    references: [referrals.id],
  }),
  user: one(users, {
    fields: [referralUses.userId],
    references: [users.id],
  }),
}));

// Типы для экспорта
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DeliveryAddress = typeof deliveryAddresses.$inferSelect;
export type NewDeliveryAddress = typeof deliveryAddresses.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type CatalogItem = typeof catalog.$inferSelect;
export type NewCatalogItem = typeof catalog.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type ReferralUse = typeof referralUses.$inferSelect;
export type NewReferralUse = typeof referralUses.$inferInsert;
