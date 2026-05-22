import { pgTable, serial, numeric, varchar, date, timestamp, index } from "drizzle-orm/pg-core";

export const salesTable = pgTable(
  "sales",
  {
    id: serial("id").primaryKey(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    note: varchar("note", { length: 500 }),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sales_date_idx").on(t.date)],
);

export type Sale = typeof salesTable.$inferSelect;
export type InsertSale = typeof salesTable.$inferInsert;
