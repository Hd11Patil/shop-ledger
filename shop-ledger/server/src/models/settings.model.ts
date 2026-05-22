import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  shopName: varchar("shop_name", { length: 120 }).notNull().default("Pani Puri & Chaat"),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  currencySymbol: varchar("currency_symbol", { length: 8 }).notNull().default("₹"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Settings = typeof settingsTable.$inferSelect;
